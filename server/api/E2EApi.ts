import { Code, LingCatProto, Methods, Package } from 'lingcat-protocol'
import type { ISendPackageFunction } from './ISendPackageFunction.ts'
import TokenManager from './TokenManager.ts'
import UserE2EKeyDataBase from '../data/UserE2EKeyDataBase.ts'
import sendError from './sendError.ts'

export default class E2EApi {
    static async onCall(sendPackage: ISendPackageFunction, mPackage: Package) {
        switch (mPackage.method_id) {
            /**
             * ===============================
             *          上传/更新密钥
             * ===============================
             */
            case Methods.Upload_E2E_Key_Request: {
                const data = LingCatProto.methods.Upload_E2E_Key_Request.decode(mPackage.data)
                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id

                if (!data.publicKey || !data.encryptedPrivateKey) {
                    return sendError(sendPackage, mPackage.method_id, 'Missing E2E key data', Code.Bad_Request)
                }

                await UserE2EKeyDataBase.save({
                    user_id,
                    key_version: data.keyVersion,
                    public_key: data.publicKey,
                    encrypted_private_key: data.encryptedPrivateKey,
                    kdf_salt: data.kdfSalt,
                    kdf_params: data.kdfParams,
                    priv_nonce: data.privNonce
                })

                sendPackage(Package.encode({
                    method_id: Methods.Upload_E2E_Key_Response,
                    flags: 0,
                    data: LingCatProto.methods.Upload_E2E_Key_Response.encode({}).finish()
                }))
                break
            }

            /**
             * ===============================
             *        获取自己的密钥包
             * ===============================
             */
            case Methods.Get_My_E2E_Key_Request: {
                const data = LingCatProto.methods.Get_My_E2E_Key_Request.decode(mPackage.data)
                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id

                let keyRecord;
                if (data.keyVersion) {
                    // 拉取特定版本
                    keyRecord = await UserE2EKeyDataBase.getSpecificVersion(user_id, data.keyVersion)
                } else {
                    // 拉取最新
                    keyRecord = await UserE2EKeyDataBase.getLatest(user_id)
                }

                if (!keyRecord) {
                    // 如果没有，返回全空（客户端会识别为 "disabled"）
                    return sendPackage(Package.encode({
                        method_id: Methods.Get_My_E2E_Key_Response,
                        flags: 0,
                        data: LingCatProto.methods.Get_My_E2E_Key_Response.encode({}).finish()
                    }))
                }

                sendPackage(Package.encode({
                    method_id: Methods.Get_My_E2E_Key_Response,
                    flags: 0,
                    data: LingCatProto.methods.Get_My_E2E_Key_Response.encode({
                        key: {
                            publicKey: keyRecord.public_key,
                            encryptedPrivateKey: keyRecord.encrypted_private_key,
                            kdfSalt: keyRecord.kdf_salt,
                            kdfParams: keyRecord.kdf_params,
                            privNonce: keyRecord.priv_nonce,
                            keyVersion: keyRecord.key_version,
                        },
                    }).finish()
                }))
                break
            }

            /**
             * ===============================
             *       批量拉取用户公钥
             * ===============================
             */
            case Methods.Get_E2E_Public_Keys_Request: {
                const data = LingCatProto.methods.Get_E2E_Public_Keys_Request.decode(mPackage.data)
                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id

                // 过滤掉空字符串和自己（可选）
                const targetIds = data.userIds.filter(id => id && id !== user_id)

                const publicKeys = await UserE2EKeyDataBase.getLatestPublicKeys(targetIds)

                sendPackage(Package.encode({
                    method_id: Methods.Get_E2E_Public_Keys_Response,
                    flags: 0,
                    data: LingCatProto.methods.Get_E2E_Public_Keys_Response.encode({
                        myUserId: user_id,
                        keys: publicKeys.map(k => ({
                            userId: k.user_id,
                            publicKey: k.public_key
                        }))
                    }).finish()
                }))
                break
            }

            /**
             * ===============================
             *        获取所有历史密钥包
             * ===============================
             */
            case Methods.Get_All_My_E2E_Keys_Request: {
                const data = LingCatProto.methods.Get_All_My_E2E_Keys_Request.decode(mPackage.data)
                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id

                const keys = await UserE2EKeyDataBase.getAll(user_id)

                sendPackage(Package.encode({
                    method_id: Methods.Get_All_My_E2E_Keys_Response,
                    flags: 0,
                    data: LingCatProto.methods.Get_All_My_E2E_Keys_Response.encode({
                        myUserId: user_id,
                        keys: keys.map(k => ({
                            publicKey: k.public_key,
                            encryptedPrivateKey: k.encrypted_private_key,
                            kdfSalt: k.kdf_salt,
                            kdfParams: k.kdf_params,
                            privNonce: k.priv_nonce,
                            keyVersion: k.key_version,
                        }))
                    }).finish()
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