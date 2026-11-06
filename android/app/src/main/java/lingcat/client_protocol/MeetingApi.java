package lingcat.client_protocol;

import com.google.protobuf.Parser;

import lingcat.methods.Methods.End_Meeting_Request;
import lingcat.methods.Methods.End_Meeting_Response;
import lingcat.methods.Methods.Get_Active_Meeting_Request;
import lingcat.methods.Methods.Get_Active_Meeting_Response;
import lingcat.methods.Methods.Get_Meeting_Token_Request;
import lingcat.methods.Methods.Get_Meeting_Token_Response;
import lingcat.methods.Methods.Start_Meeting_Request;
import lingcat.methods.Methods.Start_Meeting_Response;
import lingcat.protocol.Methods;
import lingcat.protocol.Package;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * 与 MeetingApi 对齐。
 * 对外返回结构使用 snake_case 字段名，与 client_protocol 一致。
 */
public final class MeetingApi {

    public static final long DEFAULT_TIMEOUT_MS = 30_000L;

    private MeetingApi() {}

    // ============================================================
    //                      对外数据结构
    // ============================================================

    /** 对应 TS 的 { meeting_id, room, starter_user_id } */
    public static class StartMeetingResult {
        public final String meetingId;
        public final String room;
        public final String starterUserId;

        public StartMeetingResult(String meetingId, String room, String starterUserId) {
            this.meetingId = meetingId;
            this.room = room;
            this.starterUserId = starterUserId;
        }
    }

    /** 对应 TS 的 IMeetingCredentials */
    public static class MeetingCredentials {
        public final String url;
        public final String room;
        public final String token;
        public final int maxParticipants;

        public MeetingCredentials(String url, String room, String token, int maxParticipants) {
            this.url = url;
            this.room = room;
            this.token = token;
            this.maxParticipants = maxParticipants;
        }
    }

    /** 对应 TS 的 { has_meeting, meeting_id, room, starter_user_id, title } */
    public static class ActiveMeetingResult {
        public final boolean hasMeeting;
        public final String meetingId;
        public final String room;
        public final String starterUserId;
        /** 未设置时为 null（对应 TS 的 res.title ?? undefined） */
        public final String title;

        public ActiveMeetingResult(boolean hasMeeting, String meetingId, String room,
                                   String starterUserId, String title) {
            this.hasMeeting = hasMeeting;
            this.meetingId = meetingId;
            this.room = room;
            this.starterUserId = starterUserId;
            this.title = title;
        }
    }

    // ============================================================
    //                      新增：会议成员信息
    // ============================================================

    public static class MeetingParticipant {
        public final String identity;
        public final String userId;
        public final String nickname;
        public final String remark;
        public final String avatarFileHash;

        public MeetingParticipant(String identity, String userId, String nickname, String remark, String avatarFileHash) {
            this.identity = identity;
            this.userId = userId;
            this.nickname = nickname;
            this.remark = remark;
            this.avatarFileHash = avatarFileHash;
        }
    }

    public static class MeetingParticipantsResult {
        public final String meetingId;
        public final String room;
        public final int count;
        public final List<MeetingParticipant> participants;

        public MeetingParticipantsResult(String meetingId, String room, int count, List<MeetingParticipant> participants) {
            this.meetingId = meetingId;
            this.room = room;
            this.count = count;
            this.participants = participants;
        }
    }

    // ============================================================
    //                      新增的 API
    // ============================================================

    /**
     * 查询会议在场成员 (供横幅显示人数/头像堆叠)
     */
    public static MeetingParticipantsResult getMeetingParticipants(LingCatClient client,
                                                                   String accessToken,
                                                                   String chatId,
                                                                   String meetingId,
                                                                   long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Get_Meeting_Participants_Request.Builder b =
                lingcat.methods.Methods.Get_Meeting_Participants_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setChatId(chatId);
        if (meetingId != null) {
            b.setMeetingId(meetingId);
        }

        byte[] data = await(client, Methods.Get_Meeting_Participants_Request,
                b.build().toByteArray(), timeoutMs).data;

        lingcat.methods.Methods.Get_Meeting_Participants_Response res =
                decode(lingcat.methods.Methods.Get_Meeting_Participants_Response.parser(), data);

        List<MeetingParticipant> list = new ArrayList<>();
        for (lingcat.classes.Classes.IMeetingParticipant p : res.getParticipantsList()) {
            list.add(new MeetingParticipant(
                    p.getIdentity(),
                    p.hasUserId() ? p.getUserId() : null,
                    p.hasNickname() ? p.getNickname() : null,
                    p.hasRemark() ? p.getRemark() : null,
                    p.hasAvatarFileHash() ? p.getAvatarFileHash() : null
            ));
        }

        return new MeetingParticipantsResult(
                res.getMeetingId(),
                res.getRoom(),
                res.getCount(),
                list
        );
    }

    public static MeetingParticipantsResult getMeetingParticipants(LingCatClient client,
                                                                   String accessToken,
                                                                   String chatId,
                                                                   String meetingId)
            throws InterruptedException, ExecutionException, TimeoutException {
        return getMeetingParticipants(client, accessToken, chatId, meetingId, DEFAULT_TIMEOUT_MS);
    }

    /**
     * 修改进行中会议的标题
     */
    public static String updateMeetingTitle(LingCatClient client,
                                            String accessToken,
                                            String chatId,
                                            String meetingId,
                                            String title,
                                            long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Update_Meeting_Title_Request req =
                lingcat.methods.Methods.Update_Meeting_Title_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setChatId(chatId)
                        .setMeetingId(meetingId)
                        .setTitle(title)
                        .build();

        byte[] data = await(client, Methods.Update_Meeting_Title_Request,
                req.toByteArray(), timeoutMs).data;

        lingcat.methods.Methods.Update_Meeting_Title_Response res =
                decode(lingcat.methods.Methods.Update_Meeting_Title_Response.parser(), data);
        return res.getTitle();
    }

    public static String updateMeetingTitle(LingCatClient client,
                                            String accessToken,
                                            String chatId,
                                            String meetingId,
                                            String title)
            throws InterruptedException, ExecutionException, TimeoutException {
        return updateMeetingTitle(client, accessToken, chatId, meetingId, title, DEFAULT_TIMEOUT_MS);
    }

    // ============================================================
    //                      内部工具
    // ============================================================

    private static Package await(LingCatClient client, int methodId,
                                 byte[] data, long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        long effective = timeoutMs > 0 ? timeoutMs : DEFAULT_TIMEOUT_MS;
        return client.invoke(methodId, data, 0, effective)
                .get(effective, TimeUnit.MILLISECONDS);
    }

    private static <T> T decode(Parser<T> parser, byte[] data) {
        return DecodeOrThrow.decode(parser, data);
    }

    // ============================================================
    //                      API
    // ============================================================

    /**
     * 发起会议。服务端会向对话成员广播 Meeting_Started_Event。
     *
     * @param title 可为 null
     */
    public static StartMeetingResult startMeeting(LingCatClient client,
                                                  String accessToken,
                                                  String chatId,
                                                  String title,
                                                  long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Start_Meeting_Request.Builder b = Start_Meeting_Request.newBuilder()
                .setAccessToken(accessToken)
                .setChatId(chatId);
        if (title != null) b.setTitle(title);

        byte[] data = await(client, Methods.Start_Meeting_Request,
                b.build().toByteArray(), timeoutMs).data;

        Start_Meeting_Response res = decode(Start_Meeting_Response.parser(), data);
        return new StartMeetingResult(
                res.getMeetingId(),
                res.getRoom(),
                res.getStarterUserId()
        );
    }

    public static StartMeetingResult startMeeting(LingCatClient client,
                                                  String accessToken,
                                                  String chatId,
                                                  String title)
            throws InterruptedException, ExecutionException, TimeoutException {
        return startMeeting(client, accessToken, chatId, title, DEFAULT_TIMEOUT_MS);
    }

    /**
     * 获取加入指定会议所需的 LiveKit 令牌
     */
    public static MeetingCredentials getMeetingToken(LingCatClient client,
                                                     String accessToken,
                                                     String chatId,
                                                     String meetingId,
                                                     long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Get_Meeting_Token_Request req = Get_Meeting_Token_Request.newBuilder()
                .setAccessToken(accessToken)
                .setChatId(chatId)
                .setMeetingId(meetingId)
                .build();

        byte[] data = await(client, Methods.Get_Meeting_Token_Request,
                req.toByteArray(), timeoutMs).data;

        Get_Meeting_Token_Response res = decode(Get_Meeting_Token_Response.parser(), data);
        return new MeetingCredentials(
                res.getUrl(),
                res.getRoom(),
                res.getToken(),
                res.getMaxParticipants()
        );
    }

    public static MeetingCredentials getMeetingToken(LingCatClient client,
                                                     String accessToken,
                                                     String chatId,
                                                     String meetingId)
            throws InterruptedException, ExecutionException, TimeoutException {
        return getMeetingToken(client, accessToken, chatId, meetingId, DEFAULT_TIMEOUT_MS);
    }

    /**
     * 查询对话中正在进行的会议
     */
    public static ActiveMeetingResult getActiveMeeting(LingCatClient client,
                                                       String accessToken,
                                                       String chatId,
                                                       long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Get_Active_Meeting_Request req = Get_Active_Meeting_Request.newBuilder()
                .setAccessToken(accessToken)
                .setChatId(chatId)
                .build();

        byte[] data = await(client, Methods.Get_Active_Meeting_Request,
                req.toByteArray(), timeoutMs).data;

        Get_Active_Meeting_Response res = decode(Get_Active_Meeting_Response.parser(), data);
        return new ActiveMeetingResult(
                res.getHasMeeting(),
                res.getMeetingId(),
                res.getRoom(),
                res.getStarterUserId(),
                res.hasTitle() ? res.getTitle() : null   // 对齐 res.title ?? undefined
        );
    }

    public static ActiveMeetingResult getActiveMeeting(LingCatClient client,
                                                       String accessToken,
                                                       String chatId)
            throws InterruptedException, ExecutionException, TimeoutException {
        return getActiveMeeting(client, accessToken, chatId, DEFAULT_TIMEOUT_MS);
    }

    /**
     * 结束会议（发起人 / 群主 / 管理员）
     */
    public static void endMeeting(LingCatClient client,
                                  String accessToken,
                                  String chatId,
                                  String meetingId,
                                  long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        End_Meeting_Request req = End_Meeting_Request.newBuilder()
                .setAccessToken(accessToken)
                .setChatId(chatId)
                .setMeetingId(meetingId)
                .build();

        byte[] data = await(client, Methods.End_Meeting_Request,
                req.toByteArray(), timeoutMs).data;

        // 即使返回值用不到也必须 decode，否则服务器 Error_Response 会被静默吞掉
        decode(End_Meeting_Response.parser(), data);
    }

    public static void endMeeting(LingCatClient client,
                                  String accessToken,
                                  String chatId,
                                  String meetingId)
            throws InterruptedException, ExecutionException, TimeoutException {
        endMeeting(client, accessToken, chatId, meetingId, DEFAULT_TIMEOUT_MS);
    }
}