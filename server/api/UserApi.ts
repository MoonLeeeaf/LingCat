import { Code, LingCatProto, Methods, Package } from 'lingcat-protocol'
import type { ISendPackageFunction } from './ISendPackageFunction.ts'
import UserDataBase from '../data/UserDataBase.ts'
import TokenManager from './TokenManager.ts'
import FileManager from '../data/FileManager.ts'
import sendError from './sendError.ts'
import ChatDataBase from '../data/ChatDataBase.ts'
import UserChatLinker from '../data/UserChatLinker.ts'

export default class UserApi {
    static async onCall(sendPackage: ISendPackageFunction, mPackage: Package) {
        switch (mPackage.method_id) {
            /**
             * ===============================
             *             注册请求
             * ===============================
             */
            case Methods.User_Registration_Request: {
                const { username, password, nickname } = LingCatProto.methods.User_Registration_Request.decode(mPackage.data)

                if (password.trim() == '')
                    sendError(sendPackage, mPackage.method_id, 'Password should not be empty.')
                else
                    sendPackage(Package.encode({
                        method_id: Methods.User_Registration_Response,
                        flags: 0,
                        data: LingCatProto.methods.User_Registration_Response.encode({
                            id: await UserDataBase.createUser({
                                username,
                                nickname,
                                password,
                            })
                        }).finish(),
                    }))

                break
            }
            /**
             * ===============================
             *             登录请求
             * ===============================
             */
            case Methods.User_Login_Request: {
                const { account, password } = LingCatProto.methods.User_Login_Request.decode(mPackage.data)

                const mUser = await UserDataBase.queryUserByAccount(account)
                if (mUser == null)
                    return sendError(sendPackage, mPackage.method_id, 'User doesn\'t exists', Code.Not_Found)
                if (mUser?.password != UserDataBase.hashifyPassword(password))
                    return sendError(sendPackage, mPackage.method_id, 'Password or account is not match.', Code.Bad_Request)

                const token = TokenManager.signAccessTokenForUser(mUser!.id)

                sendPackage(Package.encode({
                    method_id: Methods.User_Login_Response,
                    flags: 0,
                    data: LingCatProto.methods.User_Login_Response.encode({
                        accessToken: token
                    }).finish(),
                }))

                break
            }
            /**
             * ===============================
             *          请求用户信息
             * ===============================
             */
            case Methods.Query_User_Info_Request: {
                const data = LingCatProto.methods.Query_User_Info_Request.decode(mPackage.data)

                await TokenManager.verifyAccessToken(data.accessToken)

                const user = await UserDataBase.queryUserById(data.userId)

                if (user == null)
                    return sendError(sendPackage, mPackage.method_id, 'User doesn\'t exists', Code.Not_Found)

                sendPackage(Package.encode({
                    method_id: Methods.Query_User_Info_Response,
                    flags: 0,
                    data: LingCatProto.methods.Query_User_Info_Response.encode({
                        info: LingCatProto.classes.IUser.create({
                            username: user.username,
                            avatarFileHash: user.avatar_file_hash,
                            nickname: user.nickname,
                            description: user.description,
                            id: user.id,
                        }),
                    }).finish()
                }))
                break
            }
            case Methods.Get_User_Id_By_Username_Request: {
                const data = LingCatProto.methods.Get_User_Id_By_Username_Request.decode(mPackage.data)

                await TokenManager.verifyAccessToken(data.accessToken)

                const user = await UserDataBase.queryUserByUserName(data.username)

                if (user == null)
                    return sendError(sendPackage, mPackage.method_id, 'User doesn\'t exists', Code.Not_Found)

                sendPackage(Package.encode({
                    method_id: Methods.Get_User_Id_By_Username_Response,
                    flags: 0,
                    data: LingCatProto.methods.Get_User_Id_By_Username_Response.encode({
                        userId: user.id,
                    }).finish()
                }))
                break
            }
            case Methods.Query_My_User_Info_Request: {
                const data = LingCatProto.methods.Query_User_Info_Request.decode(mPackage.data)

                const user = (await UserDataBase.queryUserById((await TokenManager.verifyAccessToken(data.accessToken)).user_id))!

                sendPackage(Package.encode({
                    method_id: Methods.Query_User_Info_Response,
                    flags: 0,
                    data: LingCatProto.methods.Query_User_Info_Response.encode({
                        info: LingCatProto.classes.IUser.create({
                            username: user.username,
                            avatarFileHash: user.avatar_file_hash,
                            nickname: user.nickname,
                            description: user.description,
                            id: user.id,
                        }),
                    }).finish()
                }))
                break
            }
            /**
             * ===============================
             *            更新头像
             * ===============================
             */
            case Methods.Update_My_Profile_Request: {
                const data = LingCatProto.methods.Update_My_Profile_Request.decode(mPackage.data)

                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id

                if (data.avatarFileHash != '' && data.avatarFileHash)
                    if (await FileManager.queryFileByHash(data.avatarFileHash) == null)
                        return sendError(sendPackage, mPackage.method_id, 'File doesn\'t exists', Code.Not_Found)
                    else
                        await UserDataBase.updateAvatarFileHash(user_id, data.avatarFileHash!)

                if (data.username)
                    await UserDataBase.updateUserName(user_id, data.username)
                if (data.nickname)
                    await UserDataBase.updateNickName(user_id, data.nickname)
                if (data.description)
                    await UserDataBase.updateDescription(user_id, data.description)

                sendPackage(Package.encode({
                    method_id: Methods.Update_My_Profile_Response,
                    flags: 0,
                    data: LingCatProto.methods.Update_My_Profile_Response.encode({}).finish()
                }))
                break
            }
            case Methods.Verify_Password_Identity_Request: {
                const data = LingCatProto.methods.Verify_Password_Identity_Request.decode(mPackage.data)
                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id

                // 1. 获取用户信息
                const user = await UserDataBase.queryUserById(user_id)
                if (!user) {
                    return sendError(sendPackage, mPackage.method_id, 'User not found', Code.Not_Found)
                }

                // 2. 验证旧密码（如果你提供了 old_password 字段）
                if (data.oldPassword) {
                    const hashedInput = UserDataBase.hashifyPassword(data.oldPassword)
                    if (user.password !== hashedInput) {
                        return sendError(sendPackage, mPackage.method_id, 'Incorrect password', Code.Forbidden)
                    }
                } else {
                    // 如果未来扩展其他验证方式（如邮箱验证码），在这里添加 else if
                    return sendError(sendPackage, mPackage.method_id, 'No valid credential provided', Code.Bad_Request)
                }

                // 3. 签发一次性 change_token（有效期 5 分钟）
                const changeToken = TokenManager.signChangePasswordTokenForUser(user_id)

                // 4. 返回响应
                sendPackage(Package.encode({
                    method_id: Methods.Verify_Password_Identity_Response,
                    flags: 0,
                    data: LingCatProto.methods.Verify_Password_Identity_Response.encode({
                        changeToken,
                    }).finish()
                }))
                break
            }
            case Methods.Change_Password_Request: {
                const data = LingCatProto.methods.Change_Password_Request.decode(mPackage.data)
                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id
            
                // 1. 验证 change_token
                const tokenPayload = await TokenManager.verifyChangePasswordToken(data.changeToken, user_id)
                if (!tokenPayload) {
                    return sendError(sendPackage, mPackage.method_id, 'Invalid or expired change token', Code.Forbidden)
                }
            
                // 2. 更新密码
                const hashedNew = UserDataBase.hashifyPassword(data.newPassword)
                await UserDataBase.updateRawPassWord(user_id, hashedNew)
            
                // 3. （可选）使所有现有 access_token 失效，或让用户重新登录
                // 这里可以调用 TokenManager 的黑名单或直接让用户重新登录
                
                // 不过这个还没有进行设计......
                // 不好办呐, 不好办呐
            
                sendPackage(Package.encode({
                    method_id: Methods.Change_Password_Response,
                    flags: 0,
                    data: LingCatProto.methods.Change_Password_Response.encode({}).finish()
                }))
                break
            }
            default: {
                return false
            }
        }
        return true
    }
}