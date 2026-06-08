import { Package, Methods, LingCatProto } from 'lingcat-protocol'
import crypto from 'node:crypto'

export default class LingCatClient {
    server_ws: string
    server_public_key: string
    client?: WebSocket
    session: {
        keyClientToServer?: ArrayBuffer,
        recvSeq: number,
        sendSeq: number,
    } = {
            keyClientToServer: undefined,
            recvSeq: -999,
            sendSeq: -999,
        }

    constructor(options: {
        server_ws: string,
        server_public_key: string,
    }) {
        this.server_ws = options.server_ws
        this.server_public_key = options.server_public_key
    }

    on_package_listeners: Function[] = []
    invoke(option: { method_id: number, data: Uint8Array, flags?: number, timeout?: number }) {
        return this.invoke_internal({
            ...option,
            mPackage: Package.fromObject({
                method_id: option.method_id,
                flags: option.flags || 0,
                data: option.data,
            }).encrypt(this.session.sendSeq++, this.session.keyClientToServer!)
        })
    }
    invokeUnEncrypted(option: { method_id: number, data: Uint8Array, flags?: number, timeout?: number }) {
        return this.invoke_internal({
            ...option,
            mPackage: Package.fromObject({
                method_id: option.method_id,
                flags: option.flags || 0,
                data: option.data,
            })
        })
    }
    invoke_internal({ mPackage, timeout }: { mPackage: Package, timeout?: number }) {
        return new Promise((res: (mPackage: Package) => void, rej) => {
            const requestId = mPackage.REQUEST_ID
            const onRecv = (p: Package) => {
                if (Buffer.compare(p.REQUEST_ID, requestId) === 0) {
                    this.on_package_listeners.splice(this.on_package_listeners.indexOf(onRecv))
                    res(p)
                }
            }
            this.on_package_listeners.push(onRecv)

            this.client?.send(mPackage.toBuffer())

            timeout && setTimeout(() => rej('Request timeout ' + timeout + 'ms'), timeout)
        })
    }

    init() {
        if (this.client == null) {
            this.client = new WebSocket(this.server_ws)

            const client = this.client
            const session = this.session
            const on_package_listeners = this.on_package_listeners

            client.binaryType = 'arraybuffer'

            client.addEventListener('open', async () => {
                const keyPair = crypto.generateKeyPairSync('x25519')
                let keyServerToClient: ArrayBuffer | undefined

                // 发送握手请求
                client?.send(Package.fromObject({
                    method_id: Methods.HandShake_Request,
                    flags: 0,
                    data: LingCatProto.methods.HandShake_Request.encode({
                        publicKey: keyPair.publicKey.export({ type: 'spki', format: 'pem' }),
                    }).finish()
                }).toBuffer())

                client?.addEventListener('message', async (event) => {
                    if (event.data instanceof ArrayBuffer) {
                        try {
                            let mPackage = Package.fromBuffer(event.data)

                            // 按需要进行解密
                            const isEncrypted = (mPackage.FLAGS & Package.FLAG_ENCRYPTED) && (mPackage.METHOD_ID != Methods.HandShake_Response)
                            if (isEncrypted) {
                                console.log("[Client] (Encrypted, seq.recv: " + session.recvSeq + ", current seq.send: " + session.sendSeq + ") Method:", Methods.getMethodName(mPackage.METHOD_ID), "| Flags:", mPackage.FLAGS, "| Data length:", mPackage.LENGTH, '| Request ID:', mPackage.REQUEST_ID)
                                mPackage = mPackage.decrypt(session.recvSeq, keyServerToClient!)
                                session.recvSeq = mPackage.SEQ_AFTER_DECRYPTION
                            } else {
                                console.log("[Client] Method:", Methods.getMethodName(mPackage.METHOD_ID), "| Flags:", mPackage.FLAGS, "| Data length:", mPackage.LENGTH, '| Request ID:', mPackage.REQUEST_ID)
                            }
                            // 如果是加密消息, 同时应该返回加密的消息
                            function sendPackage(p: Package, option?: { forceEncrypt: boolean }) {
                                client.send((isEncrypted || option?.forceEncrypt ? p.encrypt(session.sendSeq++, session.keyClientToServer!) : p).toBuffer())
                            }

                            switch (mPackage.METHOD_ID) {
                                // 握手响应
                                case Methods.HandShake_Response: {
                                    const res = LingCatProto.methods.HandShake_Response.decode(mPackage.data)

                                    const serverPublicKey = Buffer.from(this.server_public_key)

                                    // 验证服务端签名的消息
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

                                        session.sendSeq = 0
                                        session.recvSeq = -1

                                        let sharedSecret = crypto.diffieHellman({
                                            privateKey: keyPair.privateKey,
                                            publicKey: crypto.createPublicKey(res.publicKey),
                                        })

                                        // 服务端交互所需要的对称密钥
                                        keyServerToClient = crypto.hkdfSync('sha256', sharedSecret, res.salt, 'server-to-client', 32)
                                        session.keyClientToServer = crypto.hkdfSync('sha256', sharedSecret, res.salt, 'client-to-server', 32)
                                        sharedSecret.fill(0)

                                        const id = setInterval(() => sendPackage(Package.fromObject({
                                            method_id: Methods.Ping_Request,
                                            flags: 0,
                                            data: LingCatProto.methods.Ping_Request.encode({
                                                time: Date.now()
                                            }).finish()
                                        }), { forceEncrypt: true }), 10000)
                                        client?.addEventListener('close', () => clearInterval(id))
                                    }
                                    break
                                }
                                // Ping 成功
                                case Methods.Ping_Response: {
                                    console.log('[Client] Server recv time:', LingCatProto.methods.Ping_Response.decode(mPackage.data).usage + 'ms')
                                    break
                                }
                            }
                            on_package_listeners.forEach((v) => v(mPackage))
                        } catch (e) {
                            console.error(e)
                        }
                    }
                })
            })
        }
    }
    disconnect() {
        this.client?.close()
    }
}
