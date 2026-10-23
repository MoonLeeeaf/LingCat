import { IUser, IUserRemark, LingCatProto, Methods } from "lingcat-protocol"
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
    /**
     * 验证身份并获取修改密码的临时令牌
     * @returns change_token
     */
    static async verifyPasswordIdentity(client: LingCatClient, {
        access_token,
        old_password,
        timeout,
    }: {
        access_token: string
        old_password: string
        timeout?: number
    }) {
        const response = await client.invoke({
            method_id: Methods.Verify_Password_Identity_Request,
            data: LingCatProto.methods.Verify_Password_Identity_Request.encode({
                accessToken: access_token,
                oldPassword: old_password,
            }).finish(),
            timeout,
        })
        return decodeOrThrow<LingCatProto.methods.Verify_Password_Identity_Response>(
            LingCatProto.methods.Verify_Password_Identity_Response,
            response.data
        ).changeToken
    }
    /**
     * 修改密码（需先获取 change_token）
     */
    static async changePassword(client: LingCatClient, {
        access_token,
        change_token,
        new_password,
        timeout,
    }: {
        access_token: string
        change_token: string
        new_password: string
        timeout?: number
    }) {
        decodeOrThrow<LingCatProto.methods.Change_Password_Response>(
            LingCatProto.methods.Change_Password_Response,
            (await client.invoke({
                method_id: Methods.Change_Password_Request,
                data: LingCatProto.methods.Change_Password_Request.encode({
                    accessToken: access_token,
                    changeToken: change_token,
                    newPassword: new_password,
                }).finish(),
                timeout,
            })).data
        )
    }
    static async setUserRemark(client: LingCatClient, {
        access_token,
        target_user_id,
        remark,
        timeout,
    }: {
        access_token: string
        target_user_id: string
        remark: string
        timeout?: number
    }) {
        decodeOrThrow<LingCatProto.methods.Set_User_Remark_Response>(
            LingCatProto.methods.Set_User_Remark_Response,
            (await client.invoke({
                method_id: Methods.Set_User_Remark_Request,
                data: LingCatProto.methods.Set_User_Remark_Request.encode({
                    accessToken: access_token,
                    targetUserId: target_user_id,
                    remark,
                }).finish(),
                timeout,
            })).data,
        )
    }
    static async getMyUserRemarks(client: LingCatClient, {
        access_token,
        timeout,
    }: {
        access_token: string
        timeout?: number
    }) {
        const decoded = decodeOrThrow<LingCatProto.methods.Get_My_User_Remarks_Response>(
            LingCatProto.methods.Get_My_User_Remarks_Response,
            (await client.invoke({
                method_id: Methods.Get_My_User_Remarks_Request,
                data: LingCatProto.methods.Get_My_User_Remarks_Request.encode({
                    accessToken: access_token,
                }).finish(),
                timeout,
            })).data,
        )
        // proto camelCase → 业务 snake_case
        return (decoded.remarks || []).map(r => ({
            user_id: r.userId!,
            remark: r.remark!,
        })) as IUserRemark[]
    }

    /**
     * 批量查询用户在线状态 (是否存在已授权且未断开的客户端)
     * @returns userId -> online
     */
    static async getOnlineStatus(client: LingCatClient, {
        access_token,
        user_ids,
        timeout,
    }: {
        access_token: string
        user_ids: string[]
        timeout?: number
    }): Promise<Record<string, boolean>> {
        const decoded = decodeOrThrow<LingCatProto.methods.Get_Online_Status_Response>(
            LingCatProto.methods.Get_Online_Status_Response,
            (await client.invoke({
                method_id: Methods.Get_Online_Status_Request,
                data: LingCatProto.methods.Get_Online_Status_Request.encode({
                    accessToken: access_token,
                    userIds: user_ids,
                }).finish(),
                timeout,
            })).data,
        )
        const out: Record<string, boolean> = {}
        for (const s of decoded.statuses || []) {
            if (s.userId) out[s.userId] = !!s.online
        }
        return out
    }
}
