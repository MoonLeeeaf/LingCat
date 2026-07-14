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
        return decodeOrThrow<LingCatProto.methods.User_Registration_Response>(LingCatProto.methods.User_Registration_Response,(await client.invoke({
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
        return decodeOrThrow<LingCatProto.methods.User_Login_Response>(LingCatProto.methods.User_Login_Response,(await client.invoke({
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
        timeout,
    }: {
        access_token: string
        timeout?: number
    }) {
        return decodeOrThrow(LingCatProto.methods.Authorize_Response,(await client.invoke({
            method_id: Methods.User_Registration_Request,
            data: LingCatProto.methods.Authorize_Request.encode({
                accessToken: access_token,
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
        const re = decodeOrThrow<LingCatProto.methods.Query_My_User_Info_Response>(LingCatProto.methods.Query_My_User_Info_Response,(await client.invoke({
            method_id: Methods.Query_My_User_Info_Request,
            data: LingCatProto.methods.Query_My_User_Info_Request.encode({
                accessToken: access_token,
            }).finish(),
            timeout,
        })).data)

        return {
            username: re.username,
            id: re.id,
            nickname: re.nickname,
            avatar_file_hash: re.avatarFileHash,
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
        const re = decodeOrThrow<LingCatProto.methods.Query_User_Info_Response>(LingCatProto.methods.Query_User_Info_Response,(await client.invoke({
            method_id: Methods.Query_User_Info_Request,
            data: LingCatProto.methods.Query_User_Info_Request.encode({
                accessToken: access_token,
                userId: user_id,
            }).finish(),
            timeout,
        })).data)

        return {
            username: re.username,
            id: re.id,
            nickname: re.nickname,
            avatar_file_hash: re.avatarFileHash,
        } as IUser
    }
    /**
     * 更新头像
     * @returns 访问令牌
     */
    static async updateMyAvatarFileHash(client: LingCatClient, {
        file_hash,
        timeout,
    }: {
        file_hash: string
        timeout?: number
    }) {
        return decodeOrThrow<LingCatProto.methods.Update_My_Avatar_Response>(LingCatProto.methods.Update_Chat_Avatar_Response,(await client.invoke({
            method_id: Methods.Update_My_Avatar_Request,
            data: LingCatProto.methods.Update_My_Avatar_Request.encode({
                fileHash: file_hash,
            }).finish(),
            timeout,
        })).data)
    }
}
