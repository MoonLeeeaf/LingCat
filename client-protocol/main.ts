import { Package, Methods, LingCatProto } from 'lingcat-protocol'
import crypto from 'node:crypto'
import { promisify } from 'node:util'

export default class LingCatClient {
    server_ws: string
    server_public_key: string
    client?: WebSocket

    constructor(options: {
        server_ws: string,
        server_public_key: string,
    }) {
        this.server_ws = options.server_ws
        this.server_public_key = options.server_public_key
    }

    connect() {
        if (this.client == null)
            this.client = new WebSocket(this.server_ws)
        this.client.binaryType = 'arraybuffer'

        this.client.addEventListener('open', async () => {
            const keyPair = await promisify(crypto.generateKeyPair)('x25519')
            let keyServerToClient: ArrayBuffer | undefined
            let keyClientToServer: ArrayBuffer | undefined

            let sendSeq = -1
            let recvSeq = -1

            // 发送握手请求
            this.client?.send(Package.fromObject({
                method_id: Methods.HandShake_Request,
                flags: 0,
                data: LingCatProto.methods.HandShake_Request.encode({
                    publicKey: keyPair.publicKey.export({ type: 'spki', format: 'pem' }),
                }).finish()
            }).toBuffer())

            this.client?.addEventListener('message', async (event) => {
                if (event.data instanceof ArrayBuffer) {
                    try {
                        let mPackage = Package.fromBuffer(event.data)

                        // 按需要进行解密
                        const isEncrypted = (mPackage.FLAGS & Package.FLAG_ENCRYPTED) && (mPackage.METHOD_ID != Methods.HandShake_Response)
                        if (isEncrypted) {
                            console.log("[Client] (Encrypted, recvSeq: " + recvSeq + ", current sendSeq: " + sendSeq + ") Method:", Methods.getMethodName(mPackage.METHOD_ID), "| Flags:", mPackage.FLAGS, "| Data length:", mPackage.LENGTH)
                            mPackage = mPackage.decrypt(recvSeq, keyServerToClient!)
                            recvSeq = mPackage.SEQ_AFTER_DECRYPTION
                        } else {
                            console.log("[Client] Method:", Methods.getMethodName(mPackage.METHOD_ID), "| Flags:", mPackage.FLAGS, "| Data length:", mPackage.LENGTH)
                        }
                        // 如果是加密消息, 同时应该返回加密的消息
                        function sendPackage(p: Package, option?: { forceEncrypt: boolean }) {
                            this.client.send((isEncrypted || option?.forceEncrypt ? p.encrypt(sendSeq++, keyClientToServer!) : p).toBuffer())
                        }

                        switch (mPackage.METHOD_ID) {
                            // 握手响应
                            case Methods.HandShake_Response: {
                                const res = LingCatProto.methods.HandShake_Response.decode(mPackage.data)

                                const serverPublicKey = Buffer.from(this.server_public_key)

                                if (crypto.verify(
                                    null,
                                    Buffer.concat([
                                        res.salt,
                                        Buffer.from(keyPair.publicKey.export({ type: 'spki', format: 'pem' })),
                                        Buffer.from(res.publicKey)
                                    ]),
                                    crypto.createPublicKey(serverPublicKey),
                                    res.verifyMessage
                                )) {
                                    console.log('[Client] Server verified!')

                                    sendSeq = 0
                                    recvSeq = -1

                                    let sharedSecret = crypto.diffieHellman({
                                        privateKey: keyPair.privateKey,
                                        publicKey: crypto.createPublicKey(res.publicKey),
                                    })

                                    // 服务端交互所需要的对称密钥
                                    keyServerToClient = crypto.hkdfSync('sha256', sharedSecret, res.salt, 'server-to-client', 32)
                                    keyClientToServer = crypto.hkdfSync('sha256', sharedSecret, res.salt, 'client-to-server', 32)
                                    sharedSecret.fill(0)

                                    const id = setInterval(() => sendPackage(Package.fromObject({
                                        method_id: Methods.Ping_Request,
                                        flags: 0,
                                        data: LingCatProto.methods.Ping_Request.encode({
                                            time: Date.now()
                                        }).finish()
                                    }), { forceEncrypt: true }), 10000)
                                    this.client?.addEventListener('close', () => clearInterval(id))
                                }
                                break
                            }
                            // Ping 成功
                            case Methods.Ping_Response: {
                                console.log('[Client] Server recv time:', LingCatProto.methods.Ping_Response.decode(mPackage.data).usage + 'ms')
                                break
                            }
                        }
                    } catch (e) {
                        console.error(e)
                    }
                }
            })
        })
    }
    disconnect() {
        this.client?.close()
    }
}
