import { LingCatProto, Methods, Package } from 'lingcat-protocol'
import type { ISendPackageFunction } from './ISendPackageFunction.ts'
import UserDataBase from '../data/UserDataBase.ts'
import TokenManager from './TokenManager.ts'
import FileManager from '../data/FileManager.ts'
import sendError from './sendError.ts'

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
                if (mUser?.password == UserDataBase.hashifyPassword(password))
                    sendError(sendPackage, mPackage.method_id, 'Password or account is not match.')
                else
                    sendPackage(Package.encode({
                        method_id: Methods.User_Login_Response,
                        flags: 0,
                        data: LingCatProto.methods.User_Login_Response.encode({
                            accessToken: TokenManager.signAccessTokenForUser(mUser!.id)
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
                
                await TokenManager.verifyAccessToken(data.accessToken, 'access')

                const user = await UserDataBase.queryUserById(data.userId)

                if (user == null)
                    return sendError(sendPackage, mPackage.method_id, 'User doesn\'t exists')

                sendPackage(Package.encode({
                    method_id: Methods.Query_User_Info_Response,
                    flags: 0,
                    data: LingCatProto.methods.Query_User_Info_Response.encode({
                        username: user.username,
                        avatarFileHash: user.avatar_file_hash,
                        nickname: user.nickname,
                        id: user.id,
                    }).finish()
                }))
                break
            }
            /**
             * ===============================
             *            更新头像
             * ===============================
             */
            case Methods.Update_My_Avatar_Request: {
                const data = LingCatProto.methods.Update_My_Avatar_Request.decode(mPackage.data)
                
                const user_id = (await TokenManager.verifyAccessToken(data.accessToken, 'access')).user_id

                if (await FileManager.queryFileByHash(data.fileHash) == null) 
                    return sendError(sendPackage, mPackage.method_id, 'File doesn\'t exists')

                await UserDataBase.updateAvatarFileHash(user_id, data.fileHash)

                sendPackage(Package.encode({
                    method_id: Methods.Update_My_Avatar_Response,
                    flags: 0,
                    data: LingCatProto.methods.Update_My_Avatar_Response.encode({}).finish()
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