import { Package, Methods, LingCatProto, SecureKey } from 'lingcat-protocol'
import { toUint8Array } from 'lingcat-shared'

type PendingRequest = {
    resolve: (p: Package) => void
    reject: (e: any) => void
    timer: ReturnType<typeof setTimeout>
}

export default class LingCatClient {
    server_ws: string
    server_http: string
    server_public_key: Uint8Array
    client?: WebSocket
    pingInterval?: ReturnType<typeof setInterval>

    /** 主动断开标志: 为 true 时 close 事件不触发重连 */
    private manualDisconnect = false

    session: {
        keySend?: Uint8Array,
        keyRecv?: Uint8Array,
        recvSeq: number,
        sendSeq: number,
    } = {
        recvSeq: -1,
        sendSeq: -1,
    }

    /** 请求级: request_id (hex) -> 挂起中的 invoke */
    private pendingRequests = new Map<string, PendingRequest>()

    /** 全局事件监听器 (跨重连保持) */
    on_receive_listeners: ((mPackage: Package) => void)[] = []

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

    private invoke_internal({ mPackage, timeout }: { mPackage: Package, timeout?: number }): Promise<Package> {
        const ms = timeout ?? 20000
        return new Promise<Package>((resolve, reject) => {
            const requestId = Buffer.from(mPackage.request_id).toString('hex')

            const timer = setTimeout(() => {
                this.pendingRequests.delete(requestId)
                reject('Request timeout ' + ms + 'ms (' + Methods.getMethodName(mPackage.method_id) + ')')
            }, ms)

            this.pendingRequests.set(requestId, { resolve, reject, timer })

            const sock = this.client
            if (!sock || sock.readyState !== WebSocket.OPEN) {
                clearTimeout(timer)
                this.pendingRequests.delete(requestId)
                reject('WebSocket not connected')
                return
            }

            sock.send(mPackage.toBuffer())

            console.log(
                "[发]",
                "Method:", Methods.getMethodName(mPackage.method_id),
                "| Flags:", mPackage.flags,
                "| Data length:", mPackage.length,
                "| Request ID:", mPackage.request_id,
                (!mPackage.isDecrypted
                    ? ("(Encrypted, recvSeq: " + this.session.recvSeq + ", current sendSeq: " + this.session.sendSeq + ") ")
                    : '')
            )
        })
    }

    onInit() { }

    /** 应用层心跳: 定期发 Ping_Request, 让服务端保持/检测连接存活 */
    startPing() {
        this.stopPing()
        this.pingInterval = setInterval(() => {
            const client = this.client
            const keySend = this.session.keySend
            if (!client || !keySend || client.readyState !== WebSocket.OPEN) return
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

    addOnReceiveListener(func: (mPackage: Package) => void) {
        this.on_receive_listeners.push(func)
    }

    removeOnReceiveListener(func: (mPackage: Package) => void) {
        const i = this.on_receive_listeners.indexOf(func)
        if (i >= 0) this.on_receive_listeners.splice(i, 1)
    }

    /** 拒绝所有挂起请求 (连接关闭 / 主动断开时调用) */
    private rejectAllPending(reason: string) {
        for (const [, p] of this.pendingRequests) {
            clearTimeout(p.timer)
            p.reject(reason)
        }
        this.pendingRequests.clear()
    }

    init() {
        if (this.client != null) return

        this.manualDisconnect = false

        const client = new WebSocket(this.server_ws)
        this.client = client
        const session = this.session

        client.binaryType = 'arraybuffer'

        client.addEventListener('close', () => {
            this.stopPing()
            this.rejectAllPending('Connection closed')
            if (this.client === client) this.client = undefined
            if (this.manualDisconnect) return
            // 自动重连
            this.init()
        })

        client.addEventListener('open', async () => {
            const keyPair = SecureKey.All_generateExchangeKeyPair()

            // 发送握手请求 (未加密)
            client.send(Package.encode({
                method_id: Methods.HandShake_Request,
                flags: 0,
                data: LingCatProto.methods.HandShake_Request.encode({
                    clientPublicKey: keyPair.publicKey,
                }).finish()
            }).toBuffer())

            client.addEventListener('message', async (event) => {
                if (!(event.data instanceof ArrayBuffer)) return
                try {
                    const mPackage = Package.decode(toUint8Array(event.data), session.keyRecv!, session.recvSeq)
                    session.recvSeq = mPackage.seq

                    const isEncrypted = mPackage.isDecrypted
                    console.log(
                        "[收]",
                        "Method:", Methods.getMethodName(mPackage.method_id),
                        "| Flags:", mPackage.flags,
                        "| Data length:", mPackage.length,
                        "| Request ID:", mPackage.request_id,
                        (isEncrypted
                            ? ("(Encrypted, recvSeq: " + session.recvSeq + ", current sendSeq: " + session.sendSeq + ") ")
                            : '')
                    )

                    switch (mPackage.method_id) {
                        case Methods.HandShake_Response: {
                            const res = LingCatProto.methods.HandShake_Response.decode(mPackage.data)

                            const verified = SecureKey.Client_checkSignedMessage(
                                res.messageToBeVerify,
                                res.serverPublicKey,
                                keyPair.publicKey,
                                this.server_public_key
                            )
                            if (!verified) {
                                console.error('[Client] Server verification failed, closing connection')
                                client.close()
                                return
                            }

                            console.log('[Client] Server verified!')
                            session.sendSeq = 0
                            session.recvSeq = -1

                            const sharedSecret = SecureKey.All_getSharedSecret(
                                res.serverPublicKey,
                                keyPair.privateKey
                            )
                            ; ({ keyRecv: session.keyRecv, keySend: session.keySend } = SecureKey.Client_hkdf(
                                sharedSecret,
                                res.salt
                            ))
                            sharedSecret.fill(0)

                            this.startPing()
                            this.onInit()
                            break
                        }
                        case Methods.Ping_Response: {
                            console.log(
                                '[Client] Server recv time:',
                                LingCatProto.methods.Ping_Response.decode(mPackage.data).usage + 'ms'
                            )
                            break
                        }
                    }

                    // 1. 请求响应匹配
                    const requestId = Buffer.from(mPackage.request_id).toString('hex')
                    const pending = this.pendingRequests.get(requestId)
                    if (pending) {
                        this.pendingRequests.delete(requestId)
                        clearTimeout(pending.timer)
                        pending.resolve(mPackage)
                    }

                    // 2. 全局事件分发
                    for (const listener of this.on_receive_listeners) {
                        try {
                            listener(mPackage)
                        } catch (e) {
                            console.error('[Client] on_receive_listener error', e)
                        }
                    }
                } catch (e) {
                    console.error(e)
                }
            })
        })
    }

    disconnect() {
        this.manualDisconnect = true
        this.stopPing()
        this.rejectAllPending('Client disconnected')
        this.client?.close()
        this.client = undefined
    }
}