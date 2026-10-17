import { E2EApi } from 'lingcat-client-protocol'
import { IUserE2EKey } from 'lingcat-protocol'
import { create } from 'zustand'
import { ClientManager } from '../../ClientManager.ts'
import E2EManager from './E2EManager.ts'
import { E2EPayload } from './types.ts'

// ★ 细分 E2E 状态
export type E2EStatus = 
    | 'loading'        // 正在拉取状态
    | 'disabled'       // 确认未开启 E2E
    | 'locked'         // 已获取密钥包，但未解锁
    | 'unlocked'       // 已解锁，可以加解密
    | 'error_fetch'    // 客户端未连接或断网导致无法拉取
    | 'error_server'   // 接口请求异常或服务端数据损坏

interface E2EState {
    status: E2EStatus
    myPublicKey: string | null
    /** 缓存多个版本的私钥: version -> privateKey */
    myPrivateKeys: Record<number, string>
    myKeyVersion: number

    keyBundle: IUserE2EKey | null
    peerKeys: Record<string, string>
    peerVerifyStatus: Record<string, 'unverified' | 'verified' | 'mismatch'>

    loadKeyState: () => Promise<void>
    setupNewKey: (password: string) => Promise<void>
    generateNewKey: (password: string, newVersion: number) => Promise<void>
    unlock: (password: string) => Promise<boolean>
    lock: () => void
    fetchPeerKeys: (userIds: string[]) => Promise<void>
    setPeerVerified: (userId: string) => void
    encryptForPeer: (plaintext: string, peerUserId: string) => Promise<string | null>
    decryptFromPeer: (entityJson: string, senderUserId: string) => Promise<string | null>
    getPrivateKeyByVersion: (version: number, password: string) => Promise<string | null>
    unlockSpecificVersion: (version: number, password: string) => Promise<boolean>
}

export const useE2EStore = create<E2EState>((set, get) => ({
    status: 'loading',
    myPublicKey: null,
    myPrivateKeys: {},
    myKeyVersion: 1,
    keyBundle: null,
    peerKeys: {},
    peerVerifyStatus: {},

    loadKeyState: async () => {
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) {
            set({ status: 'error_fetch' })
            return
        }

        set({ status: 'loading' })
        try {
            const bundle = await E2EApi.getMyKey(client, { access_token: session.token })
            if (!bundle) {
                set({ status: 'disabled' })
                return
            }

            const localKnownPubs = JSON.parse(localStorage.getItem('lingcat_peer_pubs') || '{}')
            const localVerify = JSON.parse(localStorage.getItem('lingcat_peer_verify') || '{}')

            const verifyStatus: Record<string, 'verified' | 'mismatch'> = {}

            for (const [uid, status] of Object.entries(localVerify)) {
                verifyStatus[uid] = status as 'verified'
            }
            for (const [uid, pub] of Object.entries(get().peerKeys)) {
                if (localKnownPubs[uid] && localKnownPubs[uid] !== pub) {
                    verifyStatus[uid] = 'mismatch'
                }
            }

            set({
                status: 'locked',
                keyBundle: bundle,
                myPublicKey: bundle.public_key,
                myKeyVersion: bundle.key_version,
                peerVerifyStatus: { ...get().peerVerifyStatus, ...verifyStatus }
            })
        } catch (e) {
            console.error('[E2E] loadKeyState failed', e)
            // ★ 请求报错，归为服务端异常
            set({ status: 'error_server' })
        }
    },

    setupNewKey: async (password) => {
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return

        const { publicKey, privateKey } = E2EManager.generateIdentityKeyPair()
        const enc = E2EManager.encryptPrivateKey(privateKey, password)

        await E2EApi.uploadKey(client, {
            access_token: session.token,
            public_key: publicKey,
            encrypted_private_key: enc.encrypted,
            kdf_salt: enc.salt,
            kdf_params: JSON.stringify(enc.kdfParams),
            priv_nonce: enc.nonce,
            key_version: 1
        })

        set(s => ({
            status: 'unlocked',
            myPrivateKeys: { ...s.myPrivateKeys, 1: privateKey },
            myPublicKey: publicKey,
            myKeyVersion: 1
        }))
    },

    generateNewKey: async (password, newVersion) => {
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return

        const { publicKey, privateKey } = E2EManager.generateIdentityKeyPair()
        const enc = E2EManager.encryptPrivateKey(privateKey, password)

        await E2EApi.uploadKey(client, {
            access_token: session.token,
            public_key: publicKey,
            encrypted_private_key: enc.encrypted,
            kdf_salt: enc.salt,
            kdf_params: JSON.stringify(enc.kdfParams),
            priv_nonce: enc.nonce,
            key_version: newVersion
        })

        set(s => ({
            status: 'unlocked',
            myPrivateKeys: { ...s.myPrivateKeys, [newVersion]: privateKey },
            myPublicKey: publicKey,
            myKeyVersion: newVersion,
        }))
    },

    unlock: async (password) => {
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return false

        try {
            const allBundles = await E2EApi.getAllMyKeys(client, { access_token: session.token })
            if (!allBundles || allBundles.length === 0) return false

            const newPrivateKeys: Record<number, string> = {}
            let decryptedLatest = false

            for (const bundle of allBundles) {
                try {
                    const priv = E2EManager.decryptPrivateKey({
                        publicKey: bundle.public_key,
                        encryptedPrivateKey: bundle.encrypted_private_key,
                        salt: bundle.kdf_salt,
                        nonce: bundle.priv_nonce,
                        kdfParams: JSON.parse(bundle.kdf_params),
                        keyVersion: bundle.key_version
                    }, password)

                    newPrivateKeys[bundle.key_version] = priv

                    if (bundle.key_version === get().myKeyVersion) {
                        decryptedLatest = true
                    }
                } catch (e) {
                    console.warn(`[E2E] 历史密钥 v${bundle.key_version} 解密失败`)
                }
            }

            if (!decryptedLatest) return false

            set({ status: 'unlocked', myPrivateKeys: newPrivateKeys })
            return true
        } catch (e) {
            return false
        }
    },

    lock: () => {
        set({ status: 'locked', myPrivateKeys: {} })
    },

    getPrivateKeyByVersion: async (version, password) => {
        const state = get()
        if (state.myPrivateKeys[version]) {
            return state.myPrivateKeys[version]
        }

        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return null

        try {
            const bundle = await E2EApi.getMyKey(client, {
                access_token: session.token,
                key_version: version
            })
            if (!bundle) return null

            const priv = E2EManager.decryptPrivateKey({
                publicKey: bundle.public_key,
                encryptedPrivateKey: bundle.encrypted_private_key,
                salt: bundle.kdf_salt,
                nonce: bundle.priv_nonce,
                kdfParams: JSON.parse(bundle.kdf_params),
                keyVersion: bundle.key_version
            }, password)

            set(s => ({
                myPrivateKeys: { ...s.myPrivateKeys, [version]: priv }
            }))
            return priv
        } catch {
            return null
        }
    },

    fetchPeerKeys: async (userIds) => {
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return

        const missing = userIds.filter(uid => !get().peerKeys[uid])
        if (missing.length === 0) return

        const res = await E2EApi.getPublicKeys(client, {
            access_token: session.token,
            userIds: missing
        })

        const nextKeys = { ...get().peerKeys }
        const nextVerify = { ...get().peerVerifyStatus }

        const localKnownPubs = JSON.parse(localStorage.getItem('lingcat_peer_pubs') || '{}')

        for (const item of res) {
            if (!item.user_id || !item.public_key) continue
            nextKeys[item.user_id] = item.public_key

            if (!nextVerify[item.user_id]) {
                if (localKnownPubs[item.user_id] && localKnownPubs[item.user_id] !== item.public_key) {
                    nextVerify[item.user_id] = 'mismatch'
                } else {
                    nextVerify[item.user_id] = 'unverified'
                }
            }
            localKnownPubs[item.user_id] = item.public_key
        }

        localStorage.setItem('lingcat_peer_pubs', JSON.stringify(localKnownPubs))
        set({ peerKeys: nextKeys, peerVerifyStatus: nextVerify })
    },

    setPeerVerified: (userId) => {
        set(s => {
            const next = { ...s.peerVerifyStatus, [userId]: 'verified' as const }
            const toSave = Object.fromEntries(
                Object.entries(next).filter(([_, v]) => v === 'verified')
            )
            localStorage.setItem('lingcat_peer_verify', JSON.stringify(toSave))
            return { peerVerifyStatus: next }
        })
    },

    encryptForPeer: async (plaintext, peerUserId) => {
        const { myPrivateKeys, peerKeys, status, myPublicKey, myKeyVersion } = get()
        if (status !== 'unlocked' || !myPublicKey) return null

        const myPriv = myPrivateKeys[myKeyVersion]
        if (!myPriv) return null

        const receiverPub = peerKeys[peerUserId]
        if (!receiverPub) return null

        try {
            const sharedKey = E2EManager.deriveSharedKey(myPriv, receiverPub)
            const { nonce, ciphertext } = E2EManager.encryptMessage(plaintext, sharedKey)
            sharedKey.fill(0)

            const payload: E2EPayload = {
                v: 1,
                keyVersion: myKeyVersion,
                senderPub: myPublicKey,
                receiverPub: receiverPub,
                nonce,
                ciphertext
            }
            return JSON.stringify(payload)
        } catch {
            return null
        }
    },

    decryptFromPeer: async (entityJson, senderUserId) => {
        const { myPrivateKeys, status } = get()
        if (status !== 'unlocked') return null

        try {
            const payload: E2EPayload = JSON.parse(entityJson)
            const myUserId = ClientManager.getActiveSession()?.userId
            const isMine = senderUserId === myUserId

            const targetPub = isMine ? payload.receiverPub : payload.senderPub
            if (!targetPub) return null

            for (const priv of Object.values(myPrivateKeys)) {
                try {
                    const sharedKey = E2EManager.deriveSharedKey(priv, targetPub)
                    const text = E2EManager.decryptMessage(payload, sharedKey)
                    sharedKey.fill(0)
                    return text
                } catch (e) {
                    // 继续尝试下一个私钥
                }
            }

            return JSON.stringify({
                text: `🔒 [此消息使用了旧密码]`,
                entities: [],
                needVersion: payload.keyVersion
            })
        } catch {
            return null
        }
    },
    
    unlockSpecificVersion: async (version: number, password: string) => {
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return false

        try {
            const bundle = await E2EApi.getMyKey(client, {
                access_token: session.token,
                key_version: version
            })
            if (!bundle) return false

            const priv = E2EManager.decryptPrivateKey({
                publicKey: bundle.public_key,
                encryptedPrivateKey: bundle.encrypted_private_key,
                salt: bundle.kdf_salt,
                nonce: bundle.priv_nonce,
                kdfParams: JSON.parse(bundle.kdf_params),
                keyVersion: bundle.key_version
            }, password)

            set(s => ({
                myPrivateKeys: { ...s.myPrivateKeys, [version]: priv }
            }))
            return true
        } catch(e) {
            console.error(`[E2E] 历史密钥 v${version} 解密失败:`, e) 
            return false
        }
    },
}))