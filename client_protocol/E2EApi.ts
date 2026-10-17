import { IUserE2EKey, LingCatProto, Methods } from 'lingcat-protocol'
import LingCatClient from "./LingCatClient.ts"
import decodeOrThrow from "./decodeOrThrow.ts"

export default class E2EApi {
    /**
     * 上传/更新端到端加密密钥包
     */
    static async uploadKey(client: LingCatClient, {
        access_token,
        public_key: publicKey,
        encrypted_private_key: encryptedPrivateKey,
        kdf_salt: kdfSalt,
        kdf_params: kdfParams,
        priv_nonce: privNonce,
        key_version: keyVersion,
        timeout,
    }: {
        access_token: string
        timeout?: number
    } & IUserE2EKey) {
        decodeOrThrow<LingCatProto.methods.Upload_E2E_Key_Response>(
            LingCatProto.methods.Upload_E2E_Key_Response,
            (await client.invoke({
                method_id: Methods.Upload_E2E_Key_Request,
                data: LingCatProto.methods.Upload_E2E_Key_Request.encode({
                    accessToken: access_token,
                    publicKey,
                    encryptedPrivateKey,
                    kdfSalt,
                    kdfParams,
                    privNonce,
                    keyVersion,
                }).finish(),
                timeout,
            })).data
        )
    }

    /**
     * 获取自己的加密私钥包
     */
    static async getMyKey(client: LingCatClient, {
        access_token,
        key_version,
        timeout,
    }: {
        access_token: string
        key_version?: number
        timeout?: number
    }): Promise<IUserE2EKey | null> {
        try {
            const reqPayload: any = { accessToken: access_token }
            // ★ 确保只有传入了有效的大于 0 的数字，才带上 keyVersion
            if (key_version && key_version > 0) {
                reqPayload.keyVersion = key_version
            }

            const decoded = decodeOrThrow<LingCatProto.methods.Get_My_E2E_Key_Response>(
                LingCatProto.methods.Get_My_E2E_Key_Response,
                (await client.invoke({
                    method_id: Methods.Get_My_E2E_Key_Request,
                    data: LingCatProto.methods.Get_My_E2E_Key_Request.encode(reqPayload).finish(),
                    timeout,
                })).data
            )
            if (!decoded.key) return null
            return {
                public_key: decoded.key.publicKey!,
                encrypted_private_key: decoded.key.encryptedPrivateKey!,
                kdf_salt: decoded.key.kdfSalt!,
                kdf_params: decoded.key.kdfParams!,
                priv_nonce: decoded.key.privNonce!,
                key_version: decoded.key.keyVersion!,
            }
        } catch (e) {
            // 如果服务端返回错误（比如密钥不存在），在这里当做 null 处理
            return null
        }
    }

    /**
     * 批量拉取其他用户的公钥
     */
    static async getPublicKeys(client: LingCatClient, {
        access_token,
        userIds,
        timeout,
    }: {
        access_token: string
        userIds: string[]
        timeout?: number
    }) {
        const decoded = decodeOrThrow<LingCatProto.methods.Get_E2E_Public_Keys_Response>(
            LingCatProto.methods.Get_E2E_Public_Keys_Response,
            (await client.invoke({
                method_id: Methods.Get_E2E_Public_Keys_Request,
                data: LingCatProto.methods.Get_E2E_Public_Keys_Request.encode({
                    accessToken: access_token,
                    userIds,
                }).finish(),
                timeout,
            })).data
        )
        // 转成业务层的 snake_case (如果需要)
        return (decoded.keys || []).map(k => ({
            user_id: k.userId,
            public_key: k.publicKey,
        }))
    }
    /**
     * 获取自己的所有历史密钥包
     */
    static async getAllMyKeys(client: LingCatClient, {
        access_token,
        timeout,
    }: {
        access_token: string
        timeout?: number
    }) {
        const decoded = decodeOrThrow<LingCatProto.methods.Get_All_My_E2E_Keys_Response>(
            LingCatProto.methods.Get_All_My_E2E_Keys_Response,
            (await client.invoke({
                method_id: Methods.Get_All_My_E2E_Keys_Request,
                data: LingCatProto.methods.Get_All_My_E2E_Keys_Request.encode({
                    accessToken: access_token,
                }).finish(),
                timeout,
            })).data
        )
        return (decoded.keys || []).map(k => ({
            public_key: k.publicKey,
            encrypted_private_key: k.encryptedPrivateKey,
            kdf_salt: k.kdfSalt,
            kdf_params: k.kdfParams,
            priv_nonce: k.privNonce,
            key_version: k.keyVersion,
        } as IUserE2EKey))
    }
}