import { Package, Methods, LingCatProto, SecureKey } from 'lingcat-protocol'
import { toUint8Array } from 'lingcat-shared'

export default class LingCatClient {
    server_ws: string
    server_http: string
    server_public_key: Uint8Array
    client?: WebSocket
    session: {
        keySend?: Uint8Array,
        keyRecv?: Uint8Array,
        recvSeq: number,
        sendSeq: number,
    } = {
            recvSeq: -999,
            sendSeq: -999,
        }

    constructor(options: {
        server_ws: string,
        server_http: string,
        server_public_key: Uint8Array,
    }) {
        this.server_ws = options.server_ws
        this.server_http = options.server_http
        this.server_public_key = options.server_public_key
    }

    getFileUrlByHash(hash: string) {
        return this.server_http + '/uploaded_files/' + hash
    }

    on_package_listeners: Function[] = []
    invoke(option: { method_id: number, data: Uint8Array, flags?: number, timeout?: number }) {
        return this.invoke_internal({
            ...option,
            mPackage: Package.encode({
                method_id: option.method_id,
                flags: option.flags || 0,
                data: option.data,
            }).encrypt(this.session.sendSeq++, this.session.keySend!)
        })
    }
    invokeUnEncrypted(option: { method_id: number, data: Uint8Array, flags?: number, timeout?: number }) {
        return this.invoke_internal({
            ...option,
            mPackage: Package.encode({
                method_id: option.method_id,
                flags: option.flags || 0,
                data: option.data,
            })
        })
    }
    invoke_internal({ mPackage, timeout }: { mPackage: Package, timeout?: number }) {
        return new Promise((res: (mPackage: Package) => void, rej) => {
            const requestId = mPackage.request_id
            const onRecv = (p: Package) => {
                if (Buffer.compare(p.request_id, requestId) === 0) {
                    this.on_package_listeners.splice(this.on_package_listeners.indexOf(onRecv))
                    res(p)
                }
            }
            this.on_package_listeners.push(onRecv)

            this.client?.send(mPackage.toBuffer())

            console.log("[发]", "Method:", Methods.getMethodName(mPackage.method_id), "| Flags:", mPackage.flags, "| Data length:", mPackage.length, '| Request ID:', mPackage.request_id, (!mPackage.isDecrypted ? ("(Encrypted, recvSeq: " + this.session.recvSeq + ", current sendSeq: " + this.session.sendSeq + ") ") : ''))

            timeout && setTimeout(() => rej('Request timeout ' + timeout + 'ms'), timeout)
        })
    }

    onInit() { }

    init() {
        if (this.client == null) {
            this.client = new WebSocket(this.server_ws)

            const client = this.client
            const session = this.session
            const on_package_listeners = this.on_package_listeners

            client.binaryType = 'arraybuffer'

            client.addEventListener('close', () => {
                client.close()
                delete this.client
                this.init()
            })

            client.addEventListener('open', async () => {
                const keyPair = SecureKey.All_generateExchangeKeyPair()

                // 发送握手请求
                client?.send(Package.encode({
                    method_id: Methods.HandShake_Request,
                    flags: 0,
                    data: LingCatProto.methods.HandShake_Request.encode({
                        clientPublicKey: keyPair.publicKey,
                    }).finish()
                }).toBuffer())

                client?.addEventListener('message', async (event) => {
                    if (event.data instanceof ArrayBuffer) {
                        try {
                            let mPackage = Package.decode(toUint8Array(event.data), session.keyRecv!, session.recvSeq)

                            session.recvSeq = mPackage.seq

                            const isEncrypted = mPackage.isDecrypted
                            console.log("[收]", "Method:", Methods.getMethodName(mPackage.method_id), "| Flags:", mPackage.flags, "| Data length:", mPackage.length, '| Request ID:', mPackage.request_id, (isEncrypted ? ("(Encrypted, recvSeq: " + session.recvSeq + ", current sendSeq: " + session.sendSeq + ") ") : ''))

                            switch (mPackage.method_id) {
                                // 握手响应
                                case Methods.HandShake_Response: {
                                    const res = LingCatProto.methods.HandShake_Response.decode(mPackage.data)

                                    // 验证服务端签名的消息
                                    if (SecureKey.Client_checkSignedMessage(
                                        res.messageToBeVerify,
                                        res.serverPublicKey,
                                        keyPair.publicKey,
                                        this.server_public_key
                                    )) {
                                        console.log('[Client] Server verified!')

                                        session.sendSeq = 0
                                        session.recvSeq = -1

                                        let sharedSecret = SecureKey.All_getSharedSecret(
                                            res.serverPublicKey,
                                            keyPair.privateKey
                                        )

                                            // 服务端交互所需要的对称密钥
                                            ; ({ keyRecv: session.keyRecv, keySend: session.keySend } = SecureKey.Client_hkdf(
                                                sharedSecret,
                                                res.salt
                                            ))

                                        sharedSecret.fill(0)

                                        /*  const id = setInterval(() => sendPackage(Package.encode({
                                             method_id: Methods.Ping_Request,
                                             flags: 0,
                                             data: LingCatProto.methods.Ping_Request.encode({
                                                 time: Date.now()
                                             }).finish()
                                         }), { forceEncrypt: true }), 15000)
                                         client?.addEventListener('close', () => clearInterval(id)) */

                                        this.onInit()
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
