package lingcat.client_protocol;

import com.google.protobuf.Parser;

import lingcat.classes.Classes.IChat;
import lingcat.classes.Classes.IChatAdmin;
import lingcat.classes.Classes.IMessage;
import lingcat.classes.Classes.IUser;
import lingcat.protocol.Methods;
import lingcat.protocol.Package;

import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * 与 TS 端 ChatApi 对齐。
 * 返回类型直接使用 protobuf 生成类（字段语义与 TS 一致，getter 天然驼峰）。
 */
public final class ChatApi {

    public static final long DEFAULT_TIMEOUT_MS = 30_000L;

    private ChatApi() {}

    /** joinChat 的返回结构 */
    public static class JoinChatResult {
        public final boolean pendingApproval;
        public JoinChatResult(boolean pendingApproval) {
            this.pendingApproval = pendingApproval;
        }
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
    //                      管理员
    // ============================================================

    /**
     * 添加管理员（仅群主可操作）
     * @param permissionsJson 可为 null；如 {"delete_messages": true}
     */
    public static void addChatAdmin(LingCatClient client,
                                    String accessToken,
                                    String chatId,
                                    String targetUserId,
                                    String permissionsJson,
                                    long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Add_Chat_Admin_Request.Builder b =
                lingcat.methods.Methods.Add_Chat_Admin_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setChatId(chatId)
                        .setTargetUserId(targetUserId);
        if (permissionsJson != null) b.setPermissions(permissionsJson);

        byte[] data = await(client, Methods.Add_Chat_Admin_Request,
                b.build().toByteArray(), timeoutMs).data;

        decode(lingcat.methods.Methods.Add_Chat_Admin_Response.parser(), data);
    }

    public static void addChatAdmin(LingCatClient client, String accessToken,
                                    String chatId, String targetUserId,
                                    String permissionsJson)
            throws InterruptedException, ExecutionException, TimeoutException {
        addChatAdmin(client, accessToken, chatId, targetUserId, permissionsJson, DEFAULT_TIMEOUT_MS);
    }

    /**
     * 修改管理员权限（仅群主或拥有 manage_admins 权限的管理员可操作）
     */
    public static void editChatAdminPermissions(LingCatClient client,
                                                String accessToken,
                                                String chatId,
                                                String targetUserId,
                                                String permissionsJson,
                                                long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Edit_Chat_Admin_Permissions_Request req =
                lingcat.methods.Methods.Edit_Chat_Admin_Permissions_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setChatId(chatId)
                        .setTargetUserId(targetUserId)
                        .setPermissions(permissionsJson)
                        .build();

        byte[] data = await(client, Methods.Edit_Chat_Admin_Permissions_Request,
                req.toByteArray(), timeoutMs).data;

        decode(lingcat.methods.Methods.Edit_Chat_Admin_Permissions_Response.parser(), data);
    }

    public static void editChatAdminPermissions(LingCatClient client, String accessToken,
                                                String chatId, String targetUserId,
                                                String permissionsJson)
            throws InterruptedException, ExecutionException, TimeoutException {
        editChatAdminPermissions(client, accessToken, chatId, targetUserId,
                permissionsJson, DEFAULT_TIMEOUT_MS);
    }

    /**
     * 删除管理员
     */
    public static void removeChatAdmin(LingCatClient client,
                                       String accessToken,
                                       String chatId,
                                       String targetUserId,
                                       long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Remove_Chat_Admin_Request req =
                lingcat.methods.Methods.Remove_Chat_Admin_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setChatId(chatId)
                        .setTargetUserId(targetUserId)
                        .build();

        byte[] data = await(client, Methods.Remove_Chat_Admin_Request,
                req.toByteArray(), timeoutMs).data;

        decode(lingcat.methods.Methods.Remove_Chat_Admin_Response.parser(), data);
    }

    public static void removeChatAdmin(LingCatClient client, String accessToken,
                                       String chatId, String targetUserId)
            throws InterruptedException, ExecutionException, TimeoutException {
        removeChatAdmin(client, accessToken, chatId, targetUserId, DEFAULT_TIMEOUT_MS);
    }

    // ============================================================
    //                      加入 / 移除成员
    // ============================================================

    /** 加入对话（群可能有申请验证问题） */
    public static JoinChatResult joinChat(LingCatClient client,
                                          String accessToken,
                                          String chatId,
                                          String answer,
                                          long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Join_Chat_Request.Builder b =
                lingcat.methods.Methods.Join_Chat_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setChatId(chatId);
        if (answer != null) b.setAnswer(answer);

        byte[] data = await(client, Methods.Join_Chat_Request,
                b.build().toByteArray(), timeoutMs).data;

        lingcat.methods.Methods.Join_Chat_Response re =
                decode(lingcat.methods.Methods.Join_Chat_Response.parser(), data);

        boolean pending = re.getPendingApproval();
        return new JoinChatResult(pending);
    }

    public static JoinChatResult joinChat(LingCatClient client, String accessToken,
                                          String chatId, String answer)
            throws InterruptedException, ExecutionException, TimeoutException {
        return joinChat(client, accessToken, chatId, answer, DEFAULT_TIMEOUT_MS);
    }

    /** 移除群成员 */
    public static void removeChatMember(LingCatClient client,
                                        String accessToken,
                                        String chatId,
                                        String targetUserId,
                                        long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Remove_Chat_Member_Request req =
                lingcat.methods.Methods.Remove_Chat_Member_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setChatId(chatId)
                        .setTargetUserId(targetUserId)
                        .build();

        byte[] data = await(client, Methods.Remove_Chat_Member_Request,
                req.toByteArray(), timeoutMs).data;

        decode(lingcat.methods.Methods.Remove_Chat_Member_Response.parser(), data);
    }

    public static void removeChatMember(LingCatClient client, String accessToken,
                                        String chatId, String targetUserId)
            throws InterruptedException, ExecutionException, TimeoutException {
        removeChatMember(client, accessToken, chatId, targetUserId, DEFAULT_TIMEOUT_MS);
    }

    // ============================================================
    //                      设置 / 资料
    // ============================================================

    /** 更新群设置（JSON 字符串，如 {"allow_join": true}） */
    public static void updateChatSettings(LingCatClient client,
                                          String accessToken,
                                          String chatId,
                                          String settingsJson,
                                          long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Update_Chat_Settings_Request req =
                lingcat.methods.Methods.Update_Chat_Settings_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setChatId(chatId)
                        .setSettings(settingsJson)
                        .build();

        byte[] data = await(client, Methods.Update_Chat_Settings_Request,
                req.toByteArray(), timeoutMs).data;

        decode(lingcat.methods.Methods.Update_Chat_Settings_Response.parser(), data);
    }

    public static void updateChatSettings(LingCatClient client, String accessToken,
                                          String chatId, String settingsJson)
            throws InterruptedException, ExecutionException, TimeoutException {
        updateChatSettings(client, accessToken, chatId, settingsJson, DEFAULT_TIMEOUT_MS);
    }

    /** 更新群资料（头像 / 标题 / 描述 / unique；null 表示不修改） */
    public static void updateChatProfile(LingCatClient client,
                                         String accessToken,
                                         String chatId,
                                         String avatarFileHash,
                                         String title,
                                         String description,
                                         String unique,
                                         long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Update_Chat_Profile_Request.Builder b =
                lingcat.methods.Methods.Update_Chat_Profile_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setChatId(chatId);
        if (avatarFileHash != null) b.setAvatarFileHash(avatarFileHash);
        if (title != null)          b.setTitle(title);
        if (description != null)    b.setDescription(description);
        if (unique != null)         b.setUnique(unique);

        byte[] data = await(client, Methods.Update_Chat_Profile_Request,
                b.build().toByteArray(), timeoutMs).data;

        decode(lingcat.methods.Methods.Update_Chat_Profile_Response.parser(), data);
    }

    public static void updateChatProfile(LingCatClient client, String accessToken,
                                         String chatId, String avatarFileHash,
                                         String title, String description, String unique)
            throws InterruptedException, ExecutionException, TimeoutException {
        updateChatProfile(client, accessToken, chatId, avatarFileHash,
                title, description, unique, DEFAULT_TIMEOUT_MS);
    }

    // ============================================================
    //                      查询
    // ============================================================

    /** 获取群管理员列表 */
    public static List<IChatAdmin> getChatAdmins(LingCatClient client,
                                                 String accessToken,
                                                 String chatId,
                                                 long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Get_Chat_Admins_Request req =
                lingcat.methods.Methods.Get_Chat_Admins_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setChatId(chatId)
                        .build();

        byte[] data = await(client, Methods.Get_Chat_Admins_Request,
                req.toByteArray(), timeoutMs).data;

        return decode(lingcat.methods.Methods.Get_Chat_Admins_Response.parser(), data)
                .getAdminsList();
    }

    public static List<IChatAdmin> getChatAdmins(LingCatClient client,
                                                 String accessToken, String chatId)
            throws InterruptedException, ExecutionException, TimeoutException {
        return getChatAdmins(client, accessToken, chatId, DEFAULT_TIMEOUT_MS);
    }

    /** 获取群成员列表 */
    public static List<IUser> getChatMembers(LingCatClient client,
                                             String accessToken,
                                             String chatId,
                                             long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Get_Chat_Members_Request req =
                lingcat.methods.Methods.Get_Chat_Members_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setChatId(chatId)
                        .build();

        byte[] data = await(client, Methods.Get_Chat_Members_Request,
                req.toByteArray(), timeoutMs).data;

        return decode(lingcat.methods.Methods.Get_Chat_Members_Response.parser(), data)
                .getMembersList();
    }

    public static List<IUser> getChatMembers(LingCatClient client,
                                             String accessToken, String chatId)
            throws InterruptedException, ExecutionException, TimeoutException {
        return getChatMembers(client, accessToken, chatId, DEFAULT_TIMEOUT_MS);
    }

    /** 创建 / 获取私聊 chat_id */
    public static String getOrCreatePrivateChat(LingCatClient client,
                                                String accessToken,
                                                String targetUserId,
                                                long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Get_Or_Create_Private_Chat_Request req =
                lingcat.methods.Methods.Get_Or_Create_Private_Chat_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setTargetUserId(targetUserId)
                        .build();

        byte[] data = await(client, Methods.Get_Or_Create_Private_Chat_Request,
                req.toByteArray(), timeoutMs).data;

        return decode(lingcat.methods.Methods.Get_Or_Create_Private_Chat_Response.parser(), data)
                .getChatId();
    }

    public static String getOrCreatePrivateChat(LingCatClient client,
                                                String accessToken, String targetUserId)
            throws InterruptedException, ExecutionException, TimeoutException {
        return getOrCreatePrivateChat(client, accessToken, targetUserId, DEFAULT_TIMEOUT_MS);
    }

    /** 从私聊中获取另一个用户的 ID（自己给自己 = 已保存消息，返回自己 ID） */
    public static String getAnotherUserFromPrivateChat(LingCatClient client,
                                                       String accessToken,
                                                       String targetChatId,
                                                       long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Get_Another_User_From_Private_Chat_Request req =
                lingcat.methods.Methods.Get_Another_User_From_Private_Chat_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setTargetChatId(targetChatId)
                        .build();

        byte[] data = await(client, Methods.Get_Another_User_From_Private_Chat_Request,
                req.toByteArray(), timeoutMs).data;

        return decode(
                lingcat.methods.Methods.Get_Another_User_From_Private_Chat_Response.parser(), data)
                .getUserId();
    }

    public static String getAnotherUserFromPrivateChat(LingCatClient client,
                                                       String accessToken, String targetChatId)
            throws InterruptedException, ExecutionException, TimeoutException {
        return getAnotherUserFromPrivateChat(client, accessToken, targetChatId, DEFAULT_TIMEOUT_MS);
    }

    /** 查询对话信息 */
    public static IChat queryChatInfo(LingCatClient client,
                                      String accessToken,
                                      String chatId,
                                      long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Query_Chat_Info_Request req =
                lingcat.methods.Methods.Query_Chat_Info_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setChatId(chatId)
                        .build();

        byte[] data = await(client, Methods.Query_Chat_Info_Request,
                req.toByteArray(), timeoutMs).data;

        return decode(lingcat.methods.Methods.Query_Chat_Info_Response.parser(), data)
                .getInfo();
    }

    public static IChat queryChatInfo(LingCatClient client,
                                      String accessToken, String chatId)
            throws InterruptedException, ExecutionException, TimeoutException {
        return queryChatInfo(client, accessToken, chatId, DEFAULT_TIMEOUT_MS);
    }

    // ============================================================
    //                      消息
    // ============================================================

    /** 拉取对话消息（before / after / limit 均可选，null 表示不填） */
    public static List<IMessage> getChatMessages(LingCatClient client,
                                                 String accessToken,
                                                 String chatId,
                                                 Integer before,
                                                 Integer after,
                                                 Integer limit,
                                                 long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Get_Chat_Messages_Request.Builder b =
                lingcat.methods.Methods.Get_Chat_Messages_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setChatId(chatId);
        if (before != null) b.setBefore(before);
        if (after != null)  b.setAfter(after);
        if (limit != null)  b.setLimit(limit);

        byte[] data = await(client, Methods.Get_Chat_Messages_Request,
                b.build().toByteArray(), timeoutMs).data;

        return decode(lingcat.methods.Methods.Get_Chat_Messages_Response.parser(), data)
                .getMessagesList();
    }

    public static List<IMessage> getChatMessages(LingCatClient client,
                                                 String accessToken,
                                                 String chatId,
                                                 Integer before,
                                                 Integer after,
                                                 Integer limit)
            throws InterruptedException, ExecutionException, TimeoutException {
        return getChatMessages(client, accessToken, chatId, before, after, limit, DEFAULT_TIMEOUT_MS);
    }

    /** 发送消息，返回服务端分配的消息 ID */
    public static int sendChatMessage(LingCatClient client,
                                      String accessToken,
                                      String chatId,
                                      String text,
                                      List<lingcat.classes.Classes.IMessageEntity> entities,
                                      long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Send_Chat_Message_Request.Builder b =
                lingcat.methods.Methods.Send_Chat_Message_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setChatId(chatId)
                        .setText(text);
        if (entities != null) {
            for (lingcat.classes.Classes.IMessageEntity e : entities) {
                b.addEntities(e);
            }
        }

        byte[] data = await(client, Methods.Send_Chat_Message_Request,
                b.build().toByteArray(), timeoutMs).data;

        return decode(lingcat.methods.Methods.Send_Chat_Message_Response.parser(), data).getId();
    }

    public static int sendChatMessage(LingCatClient client, String accessToken,
                                      String chatId, String text,
                                      List<lingcat.classes.Classes.IMessageEntity> entities)
            throws InterruptedException, ExecutionException, TimeoutException {
        return sendChatMessage(client, accessToken, chatId, text, entities, DEFAULT_TIMEOUT_MS);
    }

    /** 编辑消息 */
    public static void editChatMessage(LingCatClient client,
                                       String accessToken,
                                       String chatId,
                                       int messageId,
                                       String text,
                                       List<lingcat.classes.Classes.IMessageEntity> entities,
                                       long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Edit_Chat_Message_Request.Builder b =
                lingcat.methods.Methods.Edit_Chat_Message_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setChatId(chatId)
                        .setMessageId(messageId)
                        .setText(text);
        if (entities != null) {
            for (lingcat.classes.Classes.IMessageEntity e : entities) {
                b.addEntities(e);
            }
        }

        byte[] data = await(client, Methods.Edit_Chat_Message_Request,
                b.build().toByteArray(), timeoutMs).data;

        decode(lingcat.methods.Methods.Edit_Chat_Message_Response.parser(), data);
    }

    public static void editChatMessage(LingCatClient client, String accessToken,
                                       String chatId, int messageId, String text,
                                       List<lingcat.classes.Classes.IMessageEntity> entities)
            throws InterruptedException, ExecutionException, TimeoutException {
        editChatMessage(client, accessToken, chatId, messageId, text, entities, DEFAULT_TIMEOUT_MS);
    }

    // ============================================================
    //                      我的对话列表
    // ============================================================

    /** 获取我的所有对话 */
    public static List<IChat> getMyChats(LingCatClient client,
                                         String accessToken,
                                         Integer limit,
                                         Integer offset,
                                         long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Get_My_Chats_Request.Builder b =
                lingcat.methods.Methods.Get_My_Chats_Request.newBuilder()
                        .setAccessToken(accessToken);
        if (limit != null)  b.setLimit(limit);
        if (offset != null) b.setOffset(offset);

        byte[] data = await(client, Methods.Get_My_Chats_Request,
                b.build().toByteArray(), timeoutMs).data;

        return decode(lingcat.methods.Methods.Get_My_Chats_Response.parser(), data)
                .getChatsList();
    }

    public static List<IChat> getMyChats(LingCatClient client, String accessToken,
                                         Integer limit, Integer offset)
            throws InterruptedException, ExecutionException, TimeoutException {
        return getMyChats(client, accessToken, limit, offset, DEFAULT_TIMEOUT_MS);
    }

    /** 设置对话收藏状态 */
    public static void setChatFavourited(LingCatClient client,
                                         String accessToken,
                                         String chatId,
                                         boolean favourited,
                                         long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Set_Chat_Favourited_Request req =
                lingcat.methods.Methods.Set_Chat_Favourited_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setChatId(chatId)
                        .setFavourited(favourited)
                        .build();

        byte[] data = await(client, Methods.Set_Chat_Favourited_Request,
                req.toByteArray(), timeoutMs).data;

        decode(lingcat.methods.Methods.Set_Chat_Favourited_Response.parser(), data);
    }

    public static void setChatFavourited(LingCatClient client, String accessToken,
                                         String chatId, boolean favourited)
            throws InterruptedException, ExecutionException, TimeoutException {
        setChatFavourited(client, accessToken, chatId, favourited, DEFAULT_TIMEOUT_MS);
    }

    /** 获取我的收藏对话 */
    public static List<IChat> getMyFavouriteChats(LingCatClient client,
                                                  String accessToken,
                                                  Integer limit,
                                                  Integer offset,
                                                  long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Get_My_Favourite_Chats_Request.Builder b =
                lingcat.methods.Methods.Get_My_Favourite_Chats_Request.newBuilder()
                        .setAccessToken(accessToken);
        if (limit != null)  b.setLimit(limit);
        if (offset != null) b.setOffset(offset);

        byte[] data = await(client, Methods.Get_My_Favourite_Chats_Request,
                b.build().toByteArray(), timeoutMs).data;

        return decode(lingcat.methods.Methods.Get_My_Favourite_Chats_Response.parser(), data)
                .getChatsList();
    }

    public static List<IChat> getMyFavouriteChats(LingCatClient client, String accessToken,
                                                  Integer limit, Integer offset)
            throws InterruptedException, ExecutionException, TimeoutException {
        return getMyFavouriteChats(client, accessToken, limit, offset, DEFAULT_TIMEOUT_MS);
    }

    /** 搜索我的对话 */
    public static List<IChat> searchMyChats(LingCatClient client,
                                            String accessToken,
                                            String keyword,
                                            Integer limit,
                                            long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Search_My_Chats_Request.Builder b =
                lingcat.methods.Methods.Search_My_Chats_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setKeyword(keyword);
        if (limit != null) b.setLimit(limit);

        byte[] data = await(client, Methods.Search_My_Chats_Request,
                b.build().toByteArray(), timeoutMs).data;

        return decode(lingcat.methods.Methods.Search_My_Chats_Response.parser(), data)
                .getChatsList();
    }

    public static List<IChat> searchMyChats(LingCatClient client, String accessToken,
                                            String keyword, Integer limit)
            throws InterruptedException, ExecutionException, TimeoutException {
        return searchMyChats(client, accessToken, keyword, limit, DEFAULT_TIMEOUT_MS);
    }

    // ============================================================
    //                      解析标识符 / 建群
    // ============================================================

    /** 通过 identifier（@unique 等）解析 chat_id */
    public static String resolveChatIdentifier(LingCatClient client,
                                               String accessToken,
                                               String identifier,
                                               long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Resolve_Chat_Identifier_Request req =
                lingcat.methods.Methods.Resolve_Chat_Identifier_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setIdentifier(identifier)
                        .build();

        byte[] data = await(client, Methods.Resolve_Chat_Identifier_Request,
                req.toByteArray(), timeoutMs).data;

        return decode(lingcat.methods.Methods.Resolve_Chat_Identifier_Response.parser(), data)
                .getChatId();
    }

    public static String resolveChatIdentifier(LingCatClient client,
                                               String accessToken, String identifier)
            throws InterruptedException, ExecutionException, TimeoutException {
        return resolveChatIdentifier(client, accessToken, identifier, DEFAULT_TIMEOUT_MS);
    }

    /** 创建群组，返回 chat_id */
    public static String createGroup(LingCatClient client,
                                     String accessToken,
                                     String title,
                                     String unique,
                                     long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        lingcat.methods.Methods.Create_Group_Request.Builder b =
                lingcat.methods.Methods.Create_Group_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setTitle(title);
        if (unique != null) b.setUnique(unique);

        byte[] data = await(client, Methods.Create_Group_Request,
                b.build().toByteArray(), timeoutMs).data;

        return decode(lingcat.methods.Methods.Create_Group_Response.parser(), data)
                .getChatId();
    }

    public static String createGroup(LingCatClient client, String accessToken,
                                     String title, String unique)
            throws InterruptedException, ExecutionException, TimeoutException {
        return createGroup(client, accessToken, title, unique, DEFAULT_TIMEOUT_MS);
    }
}