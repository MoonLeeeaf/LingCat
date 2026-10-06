package lingcat.client_protocol;

import lingcat.classes.Classes.IMessageEntity;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MessageParser {

    // 匹配顺序即优先级，勿随意调整（尤其 reply / link / attachment 的相对顺序）
    private static final Pattern BOLD          = Pattern.compile("\\*\\*([^*]+)\\*\\*");
    private static final Pattern ITALIC        = Pattern.compile("\\*([^*]+)\\*");
    private static final Pattern CODE          = Pattern.compile("`([^`]+)`");
    private static final Pattern STRIKE        = Pattern.compile("~~([^~]+)~~");
    private static final Pattern SPOILER       = Pattern.compile("\\|\\|([^|]+)\\|\\|");
    private static final Pattern USER_MENTION  = Pattern.compile("\\[@([^\\]]+)\\]\\(user:([^)]+)\\)");
    private static final Pattern CHAT_MENTION  = Pattern.compile("\\[@([^\\]]+)\\]\\(chat:([^)]+)\\)");
    private static final Pattern ATTACHMENT    = Pattern.compile(
            "!\\[([^\\]]+)\\]\\((?:lingcat://file\\?hash=|file:)([^)]+)\\)");
    private static final Pattern LINK          = Pattern.compile("\\[([^\\]]+)\\]\\(([^)]+)\\)");
    private static final Pattern REPLY         = Pattern.compile("\\[reply:(\\d+)\\]");
    private static final Pattern ATTACH_PREFIX = Pattern.compile("^(?:Image|Video|File)=");

    public static class ParsedMessage {
        public final String text;
        public final List<IMessageEntity> entities;

        public ParsedMessage(String text, List<IMessageEntity> entities) {
            this.text = text;
            this.entities = entities;
        }
    }

    /**
     * 把用户输入的轻量语法解析为 text + entities。
     * 支持: **bold** *italic* `code` ~~strike~~ ||spoiler||
     *       [文字](url) [@显示名](user:id) [@群名](chat:id)
     *       ![文件](file:hash) [reply:12345]
     */
    public static ParsedMessage parseMessage(String input) {
        StringBuilder text = new StringBuilder();
        List<IMessageEntity> entities = new ArrayList<>();
        int i = 0;
        final int len = input.length();

        while (i < len) {
            // 转义: \* → 字面 *
            if (input.charAt(i) == '\\' && i + 1 < len) {
                text.append(input.charAt(i + 1));
                i += 2;
                continue;
            }

            Matcher m;
            String inner;

            // **bold**
            m = BOLD.matcher(input);
            m.region(i, len);
            if (m.lookingAt()) {
                inner = m.group(1);
                entities.add(IMessageEntity.newBuilder()
                        .setType("bold")
                        .setOffset(text.length())
                        .setLength(inner.length())
                        .build());
                text.append(inner);
                i = m.end();
                continue;
            }

            // *italic*
            m = ITALIC.matcher(input);
            m.region(i, len);
            if (m.lookingAt()) {
                inner = m.group(1);
                entities.add(IMessageEntity.newBuilder()
                        .setType("italic")
                        .setOffset(text.length())
                        .setLength(inner.length())
                        .build());
                text.append(inner);
                i = m.end();
                continue;
            }

            // `code`
            m = CODE.matcher(input);
            m.region(i, len);
            if (m.lookingAt()) {
                inner = m.group(1);
                entities.add(IMessageEntity.newBuilder()
                        .setType("code")
                        .setOffset(text.length())
                        .setLength(inner.length())
                        .build());
                text.append(inner);
                i = m.end();
                continue;
            }

            // ~~strikethrough~~
            m = STRIKE.matcher(input);
            m.region(i, len);
            if (m.lookingAt()) {
                inner = m.group(1);
                entities.add(IMessageEntity.newBuilder()
                        .setType("strikethrough")
                        .setOffset(text.length())
                        .setLength(inner.length())
                        .build());
                text.append(inner);
                i = m.end();
                continue;
            }

            // ||spoiler||
            m = SPOILER.matcher(input);
            m.region(i, len);
            if (m.lookingAt()) {
                inner = m.group(1);
                entities.add(IMessageEntity.newBuilder()
                        .setType("spoiler")
                        .setOffset(text.length())
                        .setLength(inner.length())
                        .build());
                text.append(inner);
                i = m.end();
                continue;
            }

            // [@显示名](user:id)
            m = USER_MENTION.matcher(input);
            m.region(i, len);
            if (m.lookingAt()) {
                String name = m.group(1);
                String id = m.group(2);
                int offset = text.length();
                text.append('@').append(name);
                entities.add(IMessageEntity.newBuilder()
                        .setType("user_mention")
                        .setOffset(offset)
                        .setLength(1 + name.length())
                        .setData(id)
                        .build());
                i = m.end();
                continue;
            }

            // [@群名](chat:id)
            m = CHAT_MENTION.matcher(input);
            m.region(i, len);
            if (m.lookingAt()) {
                String name = m.group(1);
                String id = m.group(2);
                int offset = text.length();
                text.append('@').append(name);
                entities.add(IMessageEntity.newBuilder()
                        .setType("chat_mention")
                        .setOffset(offset)
                        .setLength(1 + name.length())
                        .setData(id)
                        .build());
                i = m.end();
                continue;
            }

            // ![文件](lingcat://file?hash=xxx)  或  ![文件](file:xxx)
            m = ATTACHMENT.matcher(input);
            m.region(i, len);
            if (m.lookingAt()) {
                String name = m.group(1);
                String hash = m.group(2);

                Matcher pm = ATTACH_PREFIX.matcher(name);
                if (pm.find()) {
                    name = name.substring(pm.end());
                }
                if (name.isEmpty()) name = "Unnamed";

                int offset = text.length();
                text.append("[附件]");

                try {
                    JSONObject obj = new JSONObject();
                    obj.put("hash", hash);
                    obj.put("name", name);
                    entities.add(IMessageEntity.newBuilder()
                            .setType("attachment")
                            .setOffset(offset)
                            // "[附件]" = 4 个 UTF-16 码元
                            .setLength(4)
                            .setData(obj.toString())
                            .build());
                } catch (Exception ignored) {
                    // JSON 构造理论不会失败；万一失败就当普通附件占位文本，不加 entity
                }

                i = m.end();
                continue;
            }

            // [文字](url)
            m = LINK.matcher(input);
            m.region(i, len);
            if (m.lookingAt()) {
                String label = m.group(1);
                String url = m.group(2);
                entities.add(IMessageEntity.newBuilder()
                        .setType("link")
                        .setOffset(text.length())
                        .setLength(label.length())
                        .setData(url)
                        .build());
                text.append(label);
                i = m.end();
                continue;
            }

            // [reply:12345]
            m = REPLY.matcher(input);
            m.region(i, len);
            if (m.lookingAt()) {
                String id = m.group(1);
                int offset = text.length();
                text.append("[回复]");
                entities.add(IMessageEntity.newBuilder()
                        .setType("reply")
                        .setOffset(offset)
                        // "[回复]" = 4 个 UTF-16 码元
                        .setLength(4)
                        .setData(id)
                        .build());
                i = m.end();
                continue;
            }

            // 普通字符
            text.append(input.charAt(i));
            i++;
        }

        return new ParsedMessage(text.toString(), entities);
    }

    /**
     * 反向：text + entities → 轻量语法原文
     */
    public static String entitiesToRawRichText(String text, List<IMessageEntity> entities) {
        if (entities == null || entities.isEmpty()) return text;

        List<IMessageEntity> sorted = new ArrayList<>(entities);
        sorted.sort(Comparator.comparingInt(IMessageEntity::getOffset));

        StringBuilder out = new StringBuilder(text.length() + 32);
        int cursor = 0;

        for (IMessageEntity e : sorted) {
            int off = e.getOffset();
            int length = e.getLength();

            if (off > cursor) {
                out.append(text, cursor, off);
            }
            int end = Math.min(off + length, text.length());
            String seg = text.substring(off, end);

            switch (e.getType()) {
                case "bold":
                    out.append("**").append(seg).append("**");
                    break;
                case "italic":
                    out.append('*').append(seg).append('*');
                    break;
                case "code":
                    out.append('`').append(seg).append('`');
                    break;
                case "strikethrough":
                    out.append("~~").append(seg).append("~~");
                    break;
                case "spoiler":
                    out.append("||").append(seg).append("||");
                    break;
                case "link":
                    out.append('[').append(seg).append("](")
                            .append(e.getData()).append(')');
                    break;
                case "user_mention": {
                    String name = seg.startsWith("@") ? seg.substring(1) : seg;
                    out.append("[@").append(name).append("](user:")
                            .append(e.getData()).append(')');
                    break;
                }
                case "chat_mention": {
                    String name = seg.startsWith("@") ? seg.substring(1) : seg;
                    out.append("[@").append(name).append("](chat:")
                            .append(e.getData()).append(')');
                    break;
                }
                case "attachment": {
                    String name = "Unnamed";
                    String hash = "";
                    if (e.hasData()) {
                        try {
                            JSONObject obj = new JSONObject(e.getData());
                            name = obj.optString("name", "Unnamed");
                            hash = obj.optString("hash", "");
                        } catch (Exception ignored) {
                            out.append(seg);
                            cursor = off + length;
                            continue;
                        }
                    }
                    out.append("![").append(name)
                            .append("](file:").append(hash).append(')');
                    break;
                }
                case "reply":
                    out.append("[reply:").append(e.getData()).append(']');
                    break;
                default:
                    out.append(seg);
                    break;
            }

            cursor = off + length;
        }

        if (cursor < text.length()) {
            out.append(text, cursor, text.length());
        }

        return out.toString();
    }
}