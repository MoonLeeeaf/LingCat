package lingcat.client_protocol;

import lingcat.classes.Classes.IUser;
import lingcat.methods.Methods.Authorize_Request;
import lingcat.methods.Methods.Authorize_Response;
import lingcat.methods.Methods.Change_Password_Request;
import lingcat.methods.Methods.Change_Password_Response;
import lingcat.methods.Methods.Get_User_Id_By_Username_Request;
import lingcat.methods.Methods.Get_User_Id_By_Username_Response;
import lingcat.methods.Methods.Query_My_User_Info_Request;
import lingcat.methods.Methods.Query_My_User_Info_Response;
import lingcat.methods.Methods.Query_User_Info_Request;
import lingcat.methods.Methods.Query_User_Info_Response;
import lingcat.methods.Methods.Update_My_Profile_Request;
import lingcat.methods.Methods.Update_My_Profile_Response;
import lingcat.methods.Methods.User_Login_Request;
import lingcat.methods.Methods.User_Login_Response;
import lingcat.methods.Methods.User_Registration_Request;
import lingcat.methods.Methods.User_Registration_Response;
import lingcat.methods.Methods.Verify_Password_Identity_Request;
import lingcat.methods.Methods.Verify_Password_Identity_Response;
import lingcat.protocol.Methods;
import lingcat.protocol.Package;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public final class UserApi {

    /** 默认超时（与 LingCatClient.invoke 的 timeoutMs 用法保持一致） */
    public static final long DEFAULT_TIMEOUT_MS = 30_000L;

    private UserApi() {}

    /** 把 CompletableFuture<Package> 同步化（等价 await），并透传超时 */
    private static Package await(CompletableFuture<Package> future, long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        long effective = timeoutMs > 0 ? timeoutMs : DEFAULT_TIMEOUT_MS;
        return future.get(effective, TimeUnit.MILLISECONDS);
    }

    private static byte[] invokeData(LingCatClient client, int methodId, byte[] data, long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Package pkg = await(client.invoke(methodId, data, 0, timeoutMs), timeoutMs);
        return pkg.data;
    }

    /**
     * 注册新的账号
     * @return 用户 ID
     */
    public static String register(LingCatClient client,
                                  String username,
                                  String password,
                                  String nickname,
                                  long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        User_Registration_Request.Builder b = User_Registration_Request.newBuilder()
                .setPassword(password)
                .setNickname(nickname);
        if (username != null) b.setUsername(username);

        byte[] data = invokeData(client, Methods.User_Registration_Request,
                b.build().toByteArray(), timeoutMs);

        return DecodeOrThrow.decode(User_Registration_Response.parser(), data).getId();
    }

    public static String register(LingCatClient client, String username,
                                  String password, String nickname)
            throws InterruptedException, ExecutionException, TimeoutException {
        return register(client, username, password, nickname, DEFAULT_TIMEOUT_MS);
    }

    /**
     * 获取访问令牌
     * @return access_token
     */
    public static String login(LingCatClient client,
                               String account,
                               String password,
                               long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        User_Login_Request req = User_Login_Request.newBuilder()
                .setAccount(account)
                .setPassword(password)
                .build();

        byte[] data = invokeData(client, Methods.User_Login_Request,
                req.toByteArray(), timeoutMs);

        return DecodeOrThrow.decode(User_Login_Response.parser(), data).getAccessToken();
    }

    public static String login(LingCatClient client, String account, String password)
            throws InterruptedException, ExecutionException, TimeoutException {
        return login(client, account, password, DEFAULT_TIMEOUT_MS);
    }

    /**
     * 验证访问令牌以接收客户端事件
     */
    public static void authorize(LingCatClient client,
                                 String accessToken,
                                 String sessionId,
                                 long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Authorize_Request req = Authorize_Request.newBuilder()
                .setAccessToken(accessToken)
                .setSessionId(sessionId)
                .build();

        byte[] data = invokeData(client, Methods.Authorize_Request,
                req.toByteArray(), timeoutMs);

        DecodeOrThrow.decode(Authorize_Response.parser(), data);
    }

    public static void authorize(LingCatClient client, String accessToken, String sessionId)
            throws InterruptedException, ExecutionException, TimeoutException {
        authorize(client, accessToken, sessionId, DEFAULT_TIMEOUT_MS);
    }

    /**
     * 查询我的用户信息
     */
    public static IUser queryMyUserInfo(LingCatClient client,
                                        String accessToken,
                                        long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Query_My_User_Info_Request req = Query_My_User_Info_Request.newBuilder()
                .setAccessToken(accessToken)
                .build();

        byte[] data = invokeData(client, Methods.Query_My_User_Info_Request,
                req.toByteArray(), timeoutMs);

        Query_My_User_Info_Response re =
                DecodeOrThrow.decode(Query_My_User_Info_Response.parser(), data);
        return re.getInfo();
    }

    public static IUser queryMyUserInfo(LingCatClient client, String accessToken)
            throws InterruptedException, ExecutionException, TimeoutException {
        return queryMyUserInfo(client, accessToken, DEFAULT_TIMEOUT_MS);
    }

    /**
     * 查询指定用户信息
     */
    public static IUser queryUserInfo(LingCatClient client,
                                      String accessToken,
                                      String userId,
                                      long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Query_User_Info_Request req = Query_User_Info_Request.newBuilder()
                .setAccessToken(accessToken)
                .setUserId(userId)
                .build();

        byte[] data = invokeData(client, Methods.Query_User_Info_Request,
                req.toByteArray(), timeoutMs);

        Query_User_Info_Response re =
                DecodeOrThrow.decode(Query_User_Info_Response.parser(), data);
        return re.getInfo();
    }

    public static IUser queryUserInfo(LingCatClient client, String accessToken, String userId)
            throws InterruptedException, ExecutionException, TimeoutException {
        return queryUserInfo(client, accessToken, userId, DEFAULT_TIMEOUT_MS);
    }

    /**
     * 通过用户名获取用户 ID
     */
    public static String getUserIdByUsername(LingCatClient client,
                                             String accessToken,
                                             String username,
                                             long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Get_User_Id_By_Username_Request req = Get_User_Id_By_Username_Request.newBuilder()
                .setAccessToken(accessToken)
                .setUsername(username)
                .build();

        byte[] data = invokeData(client, Methods.Get_User_Id_By_Username_Request,
                req.toByteArray(), timeoutMs);

        return DecodeOrThrow.decode(Get_User_Id_By_Username_Response.parser(), data).getUserId();
    }

    public static String getUserIdByUsername(LingCatClient client,
                                             String accessToken,
                                             String username)
            throws InterruptedException, ExecutionException, TimeoutException {
        return getUserIdByUsername(client, accessToken, username, DEFAULT_TIMEOUT_MS);
    }

    /**
     * 更新资料（可选字段传 null 表示不修改）
     */
    public static void updateMyProfile(LingCatClient client,
                                       String accessToken,
                                       String username,
                                       String nickname,
                                       String description,
                                       String avatarFileHash,
                                       long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Update_My_Profile_Request.Builder b = Update_My_Profile_Request.newBuilder()
                .setAccessToken(accessToken);
        if (username != null)       b.setUsername(username);
        if (nickname != null)       b.setNickname(nickname);
        if (description != null)    b.setDescription(description);
        if (avatarFileHash != null) b.setAvatarFileHash(avatarFileHash);

        byte[] data = invokeData(client, Methods.Update_My_Profile_Request,
                b.build().toByteArray(), timeoutMs);

        DecodeOrThrow.decode(Update_My_Profile_Response.parser(), data);
    }

    public static void updateMyProfile(LingCatClient client, String accessToken,
                                       String username, String nickname,
                                       String description, String avatarFileHash)
            throws InterruptedException, ExecutionException, TimeoutException {
        updateMyProfile(client, accessToken, username, nickname,
                description, avatarFileHash, DEFAULT_TIMEOUT_MS);
    }

    /**
     * 验证身份并获取修改密码的临时令牌
     * @return change_token
     */
    public static String verifyPasswordIdentity(LingCatClient client,
                                                String accessToken,
                                                String oldPassword,
                                                long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Verify_Password_Identity_Request req = Verify_Password_Identity_Request.newBuilder()
                .setAccessToken(accessToken)
                .setOldPassword(oldPassword)
                .build();

        byte[] data = invokeData(client, Methods.Verify_Password_Identity_Request,
                req.toByteArray(), timeoutMs);

        return DecodeOrThrow.decode(Verify_Password_Identity_Response.parser(), data)
                .getChangeToken();
    }

    public static String verifyPasswordIdentity(LingCatClient client,
                                                String accessToken,
                                                String oldPassword)
            throws InterruptedException, ExecutionException, TimeoutException {
        return verifyPasswordIdentity(client, accessToken, oldPassword, DEFAULT_TIMEOUT_MS);
    }

    /**
     * 修改密码（需先获取 change_token）
     */
    public static void changePassword(LingCatClient client,
                                      String accessToken,
                                      String changeToken,
                                      String newPassword,
                                      long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Change_Password_Request req = Change_Password_Request.newBuilder()
                .setAccessToken(accessToken)
                .setChangeToken(changeToken)
                .setNewPassword(newPassword)
                .build();

        byte[] data = invokeData(client, Methods.Change_Password_Request,
                req.toByteArray(), timeoutMs);

        DecodeOrThrow.decode(Change_Password_Response.parser(), data);
    }

    public static void changePassword(LingCatClient client, String accessToken,
                                      String changeToken, String newPassword)
            throws InterruptedException, ExecutionException, TimeoutException {
        changePassword(client, accessToken, changeToken, newPassword, DEFAULT_TIMEOUT_MS);
    }
}