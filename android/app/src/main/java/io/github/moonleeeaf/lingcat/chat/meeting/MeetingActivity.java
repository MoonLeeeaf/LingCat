package io.github.moonleeeaf.lingcat.chat.meeting;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.google.android.material.bottomsheet.BottomSheetDialog;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.data.Account;
import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import io.livekit.android.renderer.TextureViewRenderer;
import io.livekit.android.room.participant.Participant;
import lingcat.client_protocol.LingCatClient;
import lingcat.client_protocol.MeetingApi;
import livekit.org.webrtc.EglBase;
import livekit.org.webrtc.SurfaceViewRenderer;
import moon3.app.Activity;
import moon3.app.MaterialDialog;
import moon3.utils.FastToast;

/**
 * 会议界面（骨架版）。
 */
public class MeetingActivity extends Activity {

    public static final String EXTRA_CHAT_ID = "chat_id";
    public static final String EXTRA_CHAT_TITLE = "chat_title";
    public static final String EXTRA_IS_STARTER = "is_starter";

    private static final String TAG = "MeetingActivity";
    private static final int REQ_PERMS = 0x4D31;
    private static final long API_TIMEOUT_MS = 15_000L;
    private static final ExecutorService IO = Executors.newSingleThreadExecutor();

    private String chatId;
    private String chatTitle;
    private boolean isStarter;

    private TextView statusTv;
    private ImageButton micBtn, cameraBtn, hangupBtn;

    private MeetingRoomController controller;
    private boolean connected = false;
    private boolean micEnabled = true;
    private boolean cameraEnabled = true;
    // 从 GridLayout 改成 LinearLayout
    private android.widget.LinearLayout videoGrid;
    private final java.util.Map<String, ParticipantTile> tiles = new java.util.LinkedHashMap<>();

    private EglBase eglBase;

    private class ParticipantTile {
        final String id;              // tile 唯一 key：{identity}:{source}
        final boolean isLocal;
        final String source;          // "camera" / "screen"
        final View root;
        final SurfaceViewRenderer renderer;
        final View placeholder;
        final TextView placeholderText;
        final TextView nameTv;
        final ImageView micIcon;
        io.livekit.android.room.track.VideoTrack videoTrack;

        ParticipantTile(String id, boolean isLocal, String source) {
            this.id = id;
            this.isLocal = isLocal;
            this.source = source;
            this.root = getLayoutInflater().inflate(R.layout.view_participant, null);
            this.renderer = root.findViewById(R.id.participant_renderer);
            this.placeholder = root.findViewById(R.id.participant_placeholder);
            this.placeholderText = root.findViewById(R.id.participant_placeholder_text);
            this.nameTv = root.findViewById(R.id.participant_name);
            this.micIcon = root.findViewById(R.id.participant_mic);

            renderer.init(eglBase.getEglBaseContext(), null);
            renderer.setEnableHardwareScaler(true);
            renderer.setMirror(isLocal && "camera".equals(source));
        }

        void setName(String name) {
            String label = name;
            if ("screen".equals(source)) label = name + " · 共享屏幕";
            nameTv.setText(label);
            if (name != null && !name.isEmpty()) {
                placeholderText.setText(String.valueOf(name.charAt(0)).toUpperCase());
            }
        }

        void setMicEnabled(boolean enabled) {
            micIcon.setAlpha(enabled ? 0.7f : 0.25f);
        }

        void attachVideo(io.livekit.android.room.track.VideoTrack track) {
            if (videoTrack == track) return;
            if (videoTrack != null) {
                try { videoTrack.removeRenderer(renderer); } catch (Exception ignored) {}
            }
            videoTrack = track;
            if (track != null) {
                track.addRenderer(renderer);
                placeholder.setVisibility(View.GONE);
            } else {
                placeholder.setVisibility(View.VISIBLE);
            }
        }

        void release() {
            try { attachVideo(null); } catch (Exception ignored) {}
            try { renderer.release(); } catch (Exception ignored) {}
        }
    }

    private static String tileKey(String identity, String source) {
        return identity + ":" + source;
    }

    private static String sourceName(io.livekit.android.room.track.Track.Source src) {
        if (src == io.livekit.android.room.track.Track.Source.SCREEN_SHARE) return "screen";
        if (src == io.livekit.android.room.track.Track.Source.CAMERA)       return "camera";
        return "other";
    }

    private final MeetingRoomController.Listener roomListener =
            new MeetingRoomController.Listener() {
                @Override public void onConnected() {
                    runOnUiThread(() -> {
                        connected = true;
                        statusTv.setVisibility(View.GONE);
                        snack("已连接");

                        // 启动前台服务保持后台通话
                        try {
                            io.github.moonleeeaf.lingcat.chat.meeting.MeetingForegroundService
                                    .start(MeetingActivity.this, chatTitle);
                        } catch (Exception e) {
                            Log.w(TAG, "start meeting fg service failed", e);
                        }

                        if (controller != null) {
                            controller.setMicrophoneEnabled(micEnabled);
                            controller.setCameraEnabled(cameraEnabled);
                        }

                        addOrUpdateLocalTiles();
                    });
                }
                @Override public void onDisconnected() {
                    runOnUiThread(() -> {
                        connected = false;
                        try {
                            io.github.moonleeeaf.lingcat.chat.meeting.MeetingForegroundService
                                    .stop(MeetingActivity.this);
                        } catch (Exception ignored) {}
                        statusTv.setText("已断开");
                        statusTv.setVisibility(View.VISIBLE);
                        finish();
                    });
                }
                @Override public void onReconnecting() {
                    runOnUiThread(() -> {
                        statusTv.setText("重新连接中...");
                        statusTv.setVisibility(View.VISIBLE);
                    });
                }
                @Override public void onReconnected() {
                    runOnUiThread(() -> statusTv.setVisibility(View.GONE));
                }
                @Override public void onParticipantJoined(io.livekit.android.room.participant.Participant p) {
                    runOnUiThread(() -> {
                        Log.i(TAG, "participant joined: " + idOf(p));
                        // 不创建 tile，等 TrackSubscribed
                    });
                }

                @Override public void onParticipantLeft(io.livekit.android.room.participant.Participant p) {
                    runOnUiThread(() -> {
                        String id = idOf(p);
                        Log.i(TAG, "participant left: " + id);
                        java.util.List<String> toRemove = new java.util.ArrayList<>();
                        for (String k : tiles.keySet()) {
                            if (k.startsWith(id + ":")) toRemove.add(k);
                        }
                        for (String k : toRemove) {
                            ParticipantTile t = tiles.remove(k);
                            if (t != null) t.release();
                        }
                        if (!toRemove.isEmpty()) rebuildGrid();
                    });
                }

                @Override public void onVideoTrackSubscribed(
                        io.livekit.android.room.participant.Participant p,
                        io.livekit.android.room.track.VideoTrack t,
                        io.livekit.android.room.track.Track.Source source) {
                    runOnUiThread(() -> {
                        String id = idOf(p);
                        String src = sourceName(source);
                        String key = tileKey(id, src);

                        ParticipantTile tile = tiles.get(key);
                        if (tile == null) {
                            tile = new ParticipantTile(key, false, src);
                            tile.setName(displayNameOf(p));
                            tiles.put(key, tile);
                            rebuildGrid();
                        }
                        tile.attachVideo(t);
                    });
                }

                @Override public void onVideoTrackUnsubscribed(
                        io.livekit.android.room.participant.Participant p,
                        io.livekit.android.room.track.VideoTrack t,
                        io.livekit.android.room.track.Track.Source source) {
                    runOnUiThread(() -> {
                        String key = tileKey(idOf(p), sourceName(source));
                        ParticipantTile tile = tiles.get(key);
                        if (tile != null) tile.attachVideo(null);
                    });
                }

                @Override public void onLocalTrackSubscribed(
                        io.livekit.android.room.track.VideoTrack t,
                        io.livekit.android.room.track.Track.Source source) {
                    runOnUiThread(() -> {
                        String src = sourceName(source);
                        ensureLocalTile(src, t);
                    });
                }
                @Override public void onError(Throwable t) {
                    runOnUiThread(() -> snack("错误: " + t.getMessage()));
                }
            };

    // ============================================================
//                      参与者 tile 管理
// ============================================================

    private static String idOf(io.livekit.android.room.participant.Participant p) {
        try {
            String identity = p.getParticipantInfo().getIdentity();
            if (identity != null && !identity.isEmpty()) return identity;
        } catch (Exception ignored) {}
        String n = p.getName();
        return n != null ? n : "?";
    }

    private static String displayNameOf(io.livekit.android.room.participant.Participant p) {
        String n = p.getName();
        if (n != null && !n.isEmpty()) return n;
        try {
            String identity = p.getParticipantInfo().getIdentity();
            if (identity != null && !identity.isEmpty()) return identity;
        } catch (Exception ignored) {}
        return "?";
    }

    private void addOrUpdateLocalTiles() {
        if (controller == null) return;
        io.livekit.android.room.track.VideoTrack cam = controller.getLocalCameraTrack();
        io.livekit.android.room.track.VideoTrack scr = controller.getLocalScreenShareTrack();
        if (cam != null) ensureLocalTile("camera", cam);
        if (scr != null) ensureLocalTile("screen", scr);
    }

    private void ensureLocalTile(String src, io.livekit.android.room.track.VideoTrack track) {
        String key = tileKey("__local__", src);
        ParticipantTile t = tiles.get(key);
        if (t == null) {
            t = new ParticipantTile(key, true, src);
            t.setName("我");
            tiles.put(key, t);
            rebuildGrid();
        }
        t.attachVideo(track);
    }

// ============================================================
//                      网格布局
// ============================================================

    // ============================================================
//                      网格布局
// ============================================================

    private void rebuildGrid() {
        if (videoGrid == null) return;
        videoGrid.removeAllViews();

        java.util.List<ParticipantTile> list = new java.util.ArrayList<>(tiles.values());
        // 本地优先
        list.sort((a, b) -> Boolean.compare(b.isLocal, a.isLocal));

        int n = list.size();
        if (n == 0) return;

        int cols = computeCols(n);
        int rows = (n + cols - 1) / cols;

        int gap = dp(6);
        float aspect = computeAspectRatio();

        int idx = 0;
        for (int r = 0; r < rows; r++) {
            android.widget.LinearLayout row = new android.widget.LinearLayout(this);
            row.setOrientation(android.widget.LinearLayout.HORIZONTAL);

            android.widget.LinearLayout.LayoutParams rowLp =
                    new android.widget.LinearLayout.LayoutParams(
                            android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT);
            if (r > 0) rowLp.topMargin = gap;
            row.setLayoutParams(rowLp);

            for (int c = 0; c < cols; c++) {
                android.widget.LinearLayout.LayoutParams tileLp =
                        new android.widget.LinearLayout.LayoutParams(0,
                                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
                if (c > 0) tileLp.leftMargin = gap;

                if (idx >= n) {
                    // 补齐空位（保持这行其它 tile 宽度不变）
                    View spacer = new View(this);
                    spacer.setLayoutParams(tileLp);
                    row.addView(spacer);
                    continue;
                }

                ParticipantTile t = list.get(idx++);
                t.root.setLayoutParams(tileLp);

                // 应用宽高比
                // 在 for 循环里，替换原来的 setAspectRatio 那几行
                if (t.root instanceof AspectRatioFrameLayout) {
                    float ratio = "screen".equals(t.source)
                            ? 16f / 9f   // 屏幕共享用横屏比例
                            : aspect;    // 摄像头用竖屏 3:4 或横屏 16:9
                    ((AspectRatioFrameLayout) t.root).setAspectRatio(ratio);
                }

                if (t.root.getParent() != null) {
                    ((android.view.ViewGroup) t.root.getParent()).removeView(t.root);
                }
                row.addView(t.root);
            }

            videoGrid.addView(row);
        }
    }

    /** 列数规则：竖屏手机，尽量少列让 tile 大 */
    private int computeCols(int n) {
        if (n <= 1) return 1;
        if (n <= 4) return 2;
        return 3;   // 5+ 都用 3 列，靠滚动
    }

    /** 竖屏 3:4，横屏 16:9 */
    private float computeAspectRatio() {
        int orientation = getResources().getConfiguration().orientation;
        if (orientation == android.content.res.Configuration.ORIENTATION_LANDSCAPE) {
            return 16f / 9f;
        }
        return 3f / 4f;
    }

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_meeting);

        chatId = getIntent().getStringExtra(EXTRA_CHAT_ID);
        chatTitle = getIntent().getStringExtra(EXTRA_CHAT_TITLE);
        isStarter = getIntent().getBooleanExtra(EXTRA_IS_STARTER, false);

        setTitle(chatTitle == null ? "会议" : chatTitle);

        if (chatId == null || chatId.isEmpty()) {
            snack("缺少 chatId");
            finish();
            return;
        }

        statusTv = findViewById(R.id.meeting_status);
        micBtn = findViewById(R.id.btn_toggle_mic);
        cameraBtn = findViewById(R.id.btn_toggle_camera);
        hangupBtn = findViewById(R.id.btn_hangup);

        micBtn.setOnClickListener(v -> {
            if (!connected) return;
            micEnabled = !micEnabled;
            controller.setMicrophoneEnabled(micEnabled);
            micBtn.setAlpha(micEnabled ? 1.0f : 0.4f);
        });

        cameraBtn.setOnClickListener(v -> {
            if (!connected) return;
            cameraEnabled = !cameraEnabled;
            controller.setCameraEnabled(cameraEnabled);
            cameraBtn.setAlpha(cameraEnabled ? 1.0f : 0.4f);
        });

        hangupBtn.setOnClickListener(v -> hangup());

        requestPermsIfNeeded();

        eglBase = EglBase.create();

// 视频容器
        androidx.core.widget.NestedScrollView scroll =
                findViewById(R.id.meeting_video_container);

        videoGrid = new android.widget.LinearLayout(this);
        videoGrid.setOrientation(android.widget.LinearLayout.VERTICAL);
        int p = dp(8);
        videoGrid.setPadding(p, p, p, p);

        scroll.addView(videoGrid, new androidx.core.widget.NestedScrollView.LayoutParams(
                androidx.core.widget.NestedScrollView.LayoutParams.MATCH_PARENT,
                androidx.core.widget.NestedScrollView.LayoutParams.WRAP_CONTENT));
    }

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }

    // ============================================================
    //                      权限
    // ============================================================

    private boolean hasCameraPerm() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                == PackageManager.PERMISSION_GRANTED;
    }

    private boolean hasMicPerm() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                == PackageManager.PERMISSION_GRANTED;
    }

    private void requestPermsIfNeeded() {
        boolean cam = hasCameraPerm();
        boolean mic = hasMicPerm();

        if (cam && mic) {
            proceedConnect();
            return;
        }

        List<String> req = new ArrayList<>();
        if (!cam) req.add(Manifest.permission.CAMERA);
        if (!mic) req.add(Manifest.permission.RECORD_AUDIO);
        ActivityCompat.requestPermissions(this, req.toArray(new String[0]), REQ_PERMS);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != REQ_PERMS) return;

        boolean cam = hasCameraPerm();
        boolean mic = hasMicPerm();

        micEnabled = mic;
        cameraEnabled = cam;

        if (!mic) micBtn.setAlpha(0.4f);
        if (!cam) cameraBtn.setAlpha(0.4f);

        if (!cam && !mic) {
            snack("未授予相机或麦克风权限，以观看模式加入");
        } else if (!mic) {
            snack("未授予麦克风权限，加入后静音");
        } else if (!cam) {
            snack("未授予相机权限，加入后不开启摄像头");
        }

        proceedConnect();
    }

    // ============================================================
    //                      连接
    // ============================================================

    private void proceedConnect() {
        statusTv.setText("正在获取会议令牌...");
        statusTv.setVisibility(View.VISIBLE);

        LingCatClient client = LingCatClientManager.getInstance().getCurrent();
        ServerConfig server = LingCatClientManager.getInstance().getCurrentServer();
        if (client == null || server == null) {
            snack("连接已断开");
            finish();
            return;
        }
        Account acc = AppDataStore.data().getActiveAccount(server.url);
        if (acc == null || acc.accessToken == null) {
            snack("登录已失效");
            finish();
            return;
        }
        final String token = acc.accessToken;

        IO.execute(() -> {
            try {
                String meetingId = null;
                if (isStarter) {
                    MeetingApi.StartMeetingResult started =
                            MeetingApi.startMeeting(client, token, chatId, chatTitle, API_TIMEOUT_MS);
                    meetingId = started.meetingId;
                    Log.i(TAG, "meeting started: " + meetingId);
                } else {
                    MeetingManager.ActiveMeeting active =
                            MeetingManager.get().getActiveMeeting(chatId);
                    if (active != null) {
                        meetingId = active.meetingId;
                    } else {
                        MeetingApi.ActiveMeetingResult res =
                                MeetingApi.getActiveMeeting(client, token, chatId, API_TIMEOUT_MS);
                        if (res == null || !res.hasMeeting) {
                            runOnUiThread(() -> {
                                snack("会议已结束");
                                finish();
                            });
                            return;
                        }
                        meetingId = res.meetingId;
                    }
                }

                MeetingApi.MeetingCredentials cred =
                        MeetingApi.getMeetingToken(client, token, chatId, meetingId, API_TIMEOUT_MS);

                final String url = normalizeLiveKitUrl(cred.url);
                final String lkToken = cred.token;

                if (url == null || url.isEmpty()) {
                    runOnUiThread(() -> {
                        snack("会议服务器地址无效");
                        finish();
                    });
                    return;
                }
                runOnUiThread(() -> {
                    if (isFinishing()) return;
                    statusTv.setText("正在连接会议服务器...");
                    controller = new MeetingRoomController(MeetingActivity.this, roomListener);
                    MeetingManager.get().attach(chatId, controller);
                    controller.connect(url, lkToken);
                });

            } catch (Exception e) {
                Log.e(TAG, "connect failed", e);
                runOnUiThread(() -> {
                    snack("加入失败: " + e.getMessage());
                    finish();
                });
            }
        });
    }

    /**
     * 把服务端返回的 LiveKit URL 归一化为 http(s)。
     *
     * 处理：
     *   - "same-origin" → 用当前 LingCat 服务器的 http(s) 地址
     *   - "wss://..." / "ws://..." → 转成 https:// / http://
     *   - 无 scheme → 补 https://
     *   - 已是 http(s):// → 原样
     */
    private String normalizeLiveKitUrl(String raw) {
        if (raw == null) return null;
        String s = raw.trim();
        if (s.isEmpty()) return null;

        // 特例：Web 端专用占位符
        if ("same-origin".equalsIgnoreCase(s)) {
            ServerConfig server = LingCatClientManager.getInstance().getCurrentServer();
            if (server == null) return null;
            String base = server.getHttpUrl();     // 例如 https://lingcat.starnet.golf
            if (base == null || base.isEmpty()) return null;
            // 去掉尾部斜杠
            while (base.endsWith("/")) base = base.substring(0, base.length() - 1);
            return base;
        }

        if (s.startsWith("wss://")) return "https://" + s.substring("wss://".length());
        if (s.startsWith("ws://"))  return "http://"  + s.substring("ws://".length());
        if (s.startsWith("https://") || s.startsWith("http://")) return s;
        return "https://" + s;
    }

    // ============================================================
    //                      挂断 / 生命周期
    // ============================================================

    private void hangup() {
        MeetingManager.get().leave();
        finish();
    }

    @Override
    protected void onDestroy() {
        try {
            io.github.moonleeeaf.lingcat.chat.meeting.MeetingForegroundService
                    .stop(this);
        } catch (Exception ignored) {}

        if (controller != null) {
            try { controller.disconnect(); } catch (Exception ignored) {}
            controller = null;
        }
        MeetingManager.get().detach();

        // 释放所有 tile
        for (ParticipantTile t : tiles.values()) {
            try { t.release(); } catch (Exception ignored) {}
        }
        tiles.clear();

        // 释放 EglBase
        if (eglBase != null) {
            try { eglBase.release(); } catch (Exception ignored) {}
            eglBase = null;
        }

        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        hangup();
    }

    // ============================================================
    //                      Snackbar
    // ============================================================

    private void snack(String msg) {
        try {
            FastToast.shortSnack(getRootContentViewHandler(), msg).show();
        } catch (Exception e) {
            android.widget.Toast.makeText(this, msg, android.widget.Toast.LENGTH_SHORT).show();
        }
    }
}