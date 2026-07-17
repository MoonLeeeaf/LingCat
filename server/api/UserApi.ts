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
            default: {
                return false
            }
        }
        return true
    }
}