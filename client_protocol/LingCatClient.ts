import { Package, Methods, LingCatProto, SecureKey } from 'lingcat-protocol'
import { toUint8Array } from 'lingcat-shared'

export default class LingCatClient {
    server_ws: string
    server_http: string
    server_public_key: Uint8Array
    client?: WebSocket
    pingInterval?: ReturnType<typeof setInterval>
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
        return this.server_http.endsWith('/')
            ? (this.server_http + 'uploaded_files/' + hash)
            : (this.server_http + '/uploaded_files/' + hash)
    }

    getFileUrlByHashAndToken(hash: string, file_access_token: string) {
        return this.getFileUrlByHash(hash) + '?file_access_token=' + file_access_token
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
        const ms = timeout ?? 20000
        return new Promise((res: (mPackage: Package) => void, rej) => {
            const requestId = mPackage.request_id
            const sock = this.client
            let done = false
            let timer: any

            const cleanup = () => {
                const i = this.on_package_listeners.indexOf(onRecv)
                if (i >= 0) this.on_package_listeners.splice(i, 1)
                if (timer) clearTimeout(timer)
                sock?.removeEventListener('close', onClose)
            }
            const onRecv = (p: Package) => {
                if (done) return
                if (Buffer.compare(p.request_id, requestId) == 0) {
                    done = true
                    cleanup()
                    res(p)
                }
            }
            // 连接断开时立刻 reject, 不必等超时
            const onClose = () => {
                if (done) return
                done = true
                cleanup()
                rej('Connection closed (' + Methods.getMethodName(mPackage.method_id) + ')')
            }
            this.on_package_listeners.push(onRecv)
            sock?.addEventListener('close', onClose)

            this.client?.send(mPackage.toBuffer())

            console.log("[发]", "Method:", Methods.getMethodName(mPackage.method_id), "| Flags:", mPackage.flags, "| Data length:", mPackage.length, '| Request ID:', mPackage.request_id, (!mPackage.isDecrypted ? ("(Encrypted, recvSeq: " + this.session.recvSeq + ", current sendSeq: " + this.session.sendSeq + ") ") : ''))

            timer = setTimeout(() => {
                if (done) return
                done = true
                cleanup()
                rej('Request timeout ' + ms + 'ms (' + Methods.getMethodName(mPackage.method_id) + ')')
            }, ms)
        })
    }

    onInit() { }

    /**
     * 应用层心跳: 定期发 Ping_Request, 让服务端保持/检测连接存活
     */
    startPing() {
        this.stopPing()
        this.pingInterval = setInterval(() => {
            const client = this.client
            const keySend = this.session.keySend
            if (!client || !keySend || client.readyState !== 1) return
            try {
                const pkt = Package.encode({
                    method_id: Methods.Ping_Request,
                    flags: 0,
                    data: LingCatProto.methods.Ping_Request.encode({ time: Date.now() }).finish(),
                }).encrypt(this.session.sendSeq++, keySend)
                client.send(pkt.toBuffer())
            } catch (e) {
                console.warn('[Client] ping failed', e)
            }
        }, 30000)
    }
    stopPing() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval)
            this.pingInterval = undefined
        }
    }

    on_receive_listeners: ((mPackage: Package) => void)[] = []
    addOnReceiveListener(func: (mPackage: Package) => void) {
        this.on_receive_listeners.push(func)
    }
    removeOnReceiveListener(func: (mPackage: Package) => void) {
        this.on_receive_listeners.splice(this.on_receive_listeners.indexOf(func), 1)
    }

    init() {
        if (this.client == null) {
            this.client = new WebSocket(this.server_ws)

            const client = this.client
            const session = this.session
            const on_package_listeners = this.on_package_listeners
            const on_receive_listeners = this.on_receive_listeners

            client.binaryType = 'arraybuffer'

            client.addEventListener('close', () => {
                this.stopPing()
                client.close()
                delete this.client
                on_package_listeners.splice(0, on_package_listeners.length)
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

                                        this.startPing()

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
                            on_receive_listeners.forEach((v) => v(mPackage))
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
