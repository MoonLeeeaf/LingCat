import { IUser, LingCatProto, Methods } from "lingcat-protocol"
import LingCatClient from "./LingCatClient.ts"
import decodeOrThrow from "./decodeOrThrow.ts"

export default class UserApi {
    /**
     * 注册新的账号
     * @returns 用户ID
     */
    static async register(client: LingCatClient, {
        password,
        nickname,
        username,
        timeout,
    }: {
        username?: string | null
        password: string
        nickname: string
        timeout?: number
    }) {
        return decodeOrThrow<LingCatProto.methods.User_Registration_Response>(LingCatProto.methods.User_Registration_Response, (await client.invoke({
            method_id: Methods.User_Registration_Request,
            data: LingCatProto.methods.User_Registration_Request.encode({
                password,
                nickname,
                username,
            }).finish(),
            timeout,
        })).data).id
    }
    /**
     * 获取访问令牌
     * @returns 访问令牌
     */
    static async login(client: LingCatClient, {
        password,
        account,
        timeout,
    }: {
        password: string
        account: string
        timeout?: number
    }) {
        return decodeOrThrow<LingCatProto.methods.User_Login_Response>(LingCatProto.methods.User_Login_Response, (await client.invoke({
            method_id: Methods.User_Login_Request,
            data: LingCatProto.methods.User_Login_Request.encode({
                password,
                account,
            }).finish(),
            timeout,
        })).data).accessToken
    }
    /**
     * 验证访问令牌以接受客户端事件
     * @returns 
     */
    static async authorize(client: LingCatClient, {
        access_token,
        session_id,
        timeout,
    }: {
        access_token: string
        session_id: string
        timeout?: number
    }) {
        decodeOrThrow<LingCatProto.methods.Authorize_Response>(LingCatProto.methods.Authorize_Response, (await client.invoke({
            method_id: Methods.Authorize_Request,
            data: LingCatProto.methods.Authorize_Request.encode({
                accessToken: access_token,
                sessionId: session_id,
            }).finish(),
            timeout,
        })).data)
    }
    /**
     * 查询我的用户信息
     * @returns 用户信息
     */
    static async queryMyUserInfo(client: LingCatClient, {
        access_token,
        timeout,
    }: {
        access_token: string
        timeout?: number
    }) {
        const re = decodeOrThrow<LingCatProto.methods.Query_My_User_Info_Response>(LingCatProto.methods.Query_My_User_Info_Response, (await client.invoke({
            method_id: Methods.Query_My_User_Info_Request,
            data: LingCatProto.methods.Query_My_User_Info_Request.encode({
                accessToken: access_token,
            }).finish(),
            timeout,
        })).data)

        return {
            username: re.info!.username,
            id: re.info!.id,
            nickname: re.info!.nickname,
            avatar_file_hash: re.info!.avatarFileHash,
            description: re.info!.description,
        } as IUser
    }
    /**
     * 查询用户信息
     * @returns 用户信息
     */
    static async queryUserInfo(client: LingCatClient, {
        access_token,
        user_id,
        timeout,
    }: {
        access_token: string
        user_id: string
        timeout?: number
    }) {
        const re = decodeOrThrow<LingCatProto.methods.Query_User_Info_Response>(LingCatProto.methods.Query_User_Info_Response, (await client.invoke({
            method_id: Methods.Query_User_Info_Request,
            data: LingCatProto.methods.Query_User_Info_Request.encode({
                accessToken: access_token,
                userId: user_id,
            }).finish(),
            timeout,
        })).data)

        return {
            username: re.info!.username,
            id: re.info!.id,
            nickname: re.info!.nickname,
            avatar_file_hash: re.info!.avatarFileHash,
            description: re.info!.description,
        } as IUser
    }
    /**
     * 通过用户名获取用户 ID
     * @returns 用户 ID
     */
    static async getUserIdByUsername(client: LingCatClient, {
        access_token,
        username,
        timeout,
    }: {
        access_token: string;
        username: string;
        timeout?: number;
    }) {
        const response = await client.invoke({
            method_id: Methods.Get_User_Id_By_Username_Request,
            data: LingCatProto.methods.Get_User_Id_By_Username_Request.encode({
                accessToken: access_token,
                username,
            }).finish(),
            timeout,
        });
        return decodeOrThrow<LingCatProto.methods.Get_User_Id_By_Username_Response>(
            LingCatProto.methods.Get_User_Id_By_Username_Response,
            response.data
        ).userId
    }
    /**
     * 更新资料
     * @returns 访问令牌
     */
    static async updateMyProfile(client: LingCatClient, {
        access_token,
        username,
        nickname,
        description,
        avatar_file_hash,
        timeout,
    }: {
        access_token: string
        username?: string
        nickname?: string
        description?: string
        avatar_file_hash?: string
        timeout?: number
    }) {
        return decodeOrThrow<LingCatProto.methods.Update_My_Profile_Response>(LingCatProto.methods.Update_My_Profile_Response, (await client.invoke({
            method_id: Methods.Update_My_Profile_Request,
            data: LingCatProto.methods.Update_My_Profile_Request.encode({
                accessToken: access_token,
                username,
                nickname,
                description,
                avatarFileHash: avatar_file_hash,
            }).finish(),
            timeout,
        })).data)
    }
}
