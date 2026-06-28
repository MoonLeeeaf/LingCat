import { LingCatProto, Methods, Package } from 'lingcat-protocol'
import type { ISendPackageFunction } from './ISendPackageFunction.ts'
import UserDataBase from '../data/UserDataBase.ts'
import TokenManager from './TokenManager.ts'

export default class UserApi {
    static async onCall(sendPackage: ISendPackageFunction, mPackage: Package) {
        switch (mPackage.method_id) {
            case Methods.User_Registration_Request: {
                const { username, password, nickname } = LingCatProto.methods.User_Registration_Request.decode(mPackage.data)

                if (password.trim() == '')
                    sendPackage(Package.encode({
                        method_id: Methods.Error_Response,
                        flags: 0,
                        data: LingCatProto.methods.Error_Response.encode({
                            requestMethod: mPackage.method_id,
                            message: 'Password should not be empty.',
                        }).finish(),
                    }))
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
            case Methods.User_Login_Request: {
                const { account, password } = LingCatProto.methods.User_Login_Request.decode(mPackage.data)

                const mUser = await UserDataBase.queryUserByAccount(account)
                if (mUser?.password == UserDataBase.hashifyPassword(password))
                    sendPackage(Package.encode({
                        method_id: Methods.Error_Response,
                        flags: 0,
                        data: LingCatProto.methods.Error_Response.encode({
                            requestMethod: mPackage.method_id,
                            message: 'Password or account is not match.',
                        }).finish(),
                    }))
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
            default: {
                return false
            }
        }
        return true
    }
}