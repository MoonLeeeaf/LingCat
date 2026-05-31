import { WebSocketServer } from 'ws'
import express from 'express'
import http from 'node:http'
import { Package, Methods, LingCatProto } from 'lingcat-protocol'
import fs from 'node:fs'
import { fileExists, mkdir } from 'lingcat-shared'
import crypto from 'node:crypto'
import { promisify } from 'node:util'
import { base_data_path } from './config.ts'

export default function createLingCatServer() {
    const app = express()
    const httpServer = http.createServer(app)
    const wsServer = new WebSocketServer({
        server: httpServer,
    })

    if (!fileExists(`${base_data_path}/key/`)) {
        console.log('[Server]', '生成服务端密钥...')
        mkdir(`${base_data_path}/key`)
        const keyPair = crypto.generateKeyPairSync('ed25519')
        fs.writeFileSync(`${base_data_path}/key/public`, keyPair.publicKey.export({ type: 'spki', format: 'pem' }))
        fs.writeFileSync(`${base_data_path}/key/private`, keyPair.privateKey.export({ type: 'pkcs8', format: 'pem' }))
    }

    wsServer.on('connection', async (client) => {
        const keyPair = crypto.generateKeyPairSync('x25519')
        const privateKey = fs.readFileSync(`${base_data_path}/key/private`)
        let keyServerToClient: ArrayBuffer | undefined
        let keyClientToServer: ArrayBuffer | undefined

        let sendSeq = -1
        let recvSeq = -1

        client.on('close', () => {
            if (keyServerToClient) {
                new Uint8Array(keyServerToClient).fill(0);
            }
            if (keyServerToClient) {
                new Uint8Array(keyServerToClient).fill(0);
            }
        })

        client.on('message', async (data, isBinary) => {
            if (!isBinary) return
            try {
                let mPackage = Package.fromBuffer(data)

                // 按需要进行解密
                const isEncrypted = (mPackage.FLAGS & Package.FLAG_ENCRYPTED) && (mPackage.METHOD_ID != Methods.HandShake_Request)
                if (isEncrypted) {
                    console.log("[Server] (Encrypted, recvSeq: " + recvSeq + ", current sendSeq: " + sendSeq + ") Method:", Methods.getMethodName(mPackage.METHOD_ID), "| Flags:", mPackage.FLAGS, "| Data length:", mPackage.LENGTH)
                    mPackage = mPackage.decrypt(recvSeq, keyClientToServer!)
                    recvSeq = mPackage.SEQ_AFTER_DECRYPTION
                } else {
                    console.log("[Server] Method:", Methods.getMethodName(mPackage.METHOD_ID), "| Flags:", mPackage.FLAGS, "| Data length:", mPackage.LENGTH)
                }
                // 如果是加密消息, 同时应该返回加密的消息
                function sendPackage(p: Package, option?: { forceEncrypt: boolean }) {
                    client.send((isEncrypted || option?.forceEncrypt ? p.encrypt(sendSeq++, keyServerToClient!) : p).toBuffer())
                }

                switch (mPackage.METHOD_ID) {
                    // 握手请求
                    case Methods.HandShake_Request: {
                        // 计算共享秘密
                        const clientPublicKey = Buffer.from(
                            LingCatProto.methods.HandShake_Request.decode(mPackage.data).publicKey
                        )
                        let sharedSecret = crypto.diffieHellman({
                            privateKey: keyPair.privateKey,
                            publicKey: crypto.createPublicKey(clientPublicKey),
                        })

                        // 生成盐值, 并签名交由客户端进行验证
                        const salt = crypto.randomBytes(16)

                        // 与客户端交互所需要的对称密钥
                        keyServerToClient = await promisify(crypto.hkdf)('sha256', sharedSecret, salt, 'server-to-client', 32)
                        keyClientToServer = await promisify(crypto.hkdf)('sha256', sharedSecret, salt, 'client-to-server', 32)
                        sharedSecret.fill(0)

                        sendSeq = 0
                        recvSeq = -1

                        sendPackage(Package.fromObject({
                            method_id: Methods.HandShake_Response,
                            flags: 0,
                            data: LingCatProto.methods.HandShake_Response.encode({
                                salt,
                                publicKey: keyPair.publicKey.export({ type: 'spki', format: 'pem' }),
                                verifyMessage: crypto.sign(
                                    null,
                                    Buffer.concat([
                                        salt,
                                        clientPublicKey,
                                        Buffer.from(keyPair.publicKey.export({ type: 'spki', format: 'pem' }))
                                    ]),
                                    crypto.createPrivateKey(privateKey)
                                )
                            }).finish()
                        }))
                        break
                    }
                    // Ping 请求
                    case Methods.Ping_Request: {
                        sendPackage(Package.fromObject({
                            method_id: Methods.Ping_Response,
                            flags: 0,
                            data: LingCatProto.methods.Ping_Response.encode({
                                usage: Date.now() - LingCatProto.methods.Ping_Request.decode(mPackage.data).time
                            }).finish()
                        }))
                        break
                    }
                }

            } catch (e) {
                console.error(e)
            }
        })
    })

    return {
        wsServer,
        httpServer,
        app,
    }
}
