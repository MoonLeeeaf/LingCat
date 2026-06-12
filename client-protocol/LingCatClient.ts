import { Package, Methods, LingCatProto } from 'lingcat-protocol'
import { x25519, ed25519 } from '@noble/curves/ed25519.js'
import { hkdf } from '@noble/hashes/hkdf.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { concatBytes } from '@noble/hashes/utils.js'

function pemToEd25519Bytes(pem: string) {
    const b64 = pem
        .replace(/-----BEGIN PUBLIC KEY-----/, '')
        .replace(/-----END PUBLIC KEY-----/, '')
        .replace(/\s/g, '');
    const der = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
    return der.slice(-32);
}

function x25519BytesToPem(rawKey: Uint8Array): string {
    // 算法标识 OID 1.3.101.110 + 公钥位串
    const oid = Uint8Array.from([0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x6e, 0x03, 0x21, 0x00])
    const spki = concatBytes(oid, rawKey)
    const pem = `-----BEGIN PUBLIC KEY-----\n${btoa(String.fromCharCode(...spki))}\n-----END PUBLIC KEY-----\n`
    return pem
}

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
                const clientPrivateKey = x25519.utils.randomSecretKey()
                const clientPublicKey = x25519.getPublicKey(clientPrivateKey)

                const serverLongPublicKey = pemToEd25519Bytes(this.server_public_key)

                // 发送握手请求
                client.send(Package.fromObject({
                    method_id: Methods.HandShake_Request,
                    flags: 0,
                    data: LingCatProto.methods.HandShake_Request.encode({
                        publicKey: x25519BytesToPem(clientPublicKey),
                    }).finish()
                }).toBuffer())

                let keyServerToClient: Uint8Array

                client.addEventListener('message', async (event) => {
                    if (event.data instanceof ArrayBuffer) {
                        try {
                            let mPackage = Package.fromBuffer(new Uint8Array(event.data))

                            const isEncrypted = (mPackage.FLAGS & Package.FLAG_ENCRYPTED) &&
                                (mPackage.METHOD_ID != Methods.HandShake_Response)
                            if (isEncrypted) {
                                console.log("[Client] (Encrypted, seq.recv:", session.recvSeq, ", seq.send:", session.sendSeq, ") Method:", Methods.getMethodName(mPackage.METHOD_ID))
                                mPackage = mPackage.decrypt(session.recvSeq, keyServerToClient!)
                                session.recvSeq = mPackage.SEQ_AFTER_DECRYPTION;
                            } else {
                                console.log("[Client] Method:", Methods.getMethodName(mPackage.METHOD_ID))
                            }

                            function sendPackage(p: Package, option?: { forceEncrypt: boolean }) {
                                const pkgToSend = (isEncrypted || option?.forceEncrypt)
                                    ? p.encrypt(session.sendSeq++, session.keyClientToServer!)
                                    : p;
                                client.send(pkgToSend.toBuffer())
                            }

                            switch (mPackage.METHOD_ID) {
                                case Methods.HandShake_Response: {
                                    const res = LingCatProto.methods.HandShake_Response.decode(mPackage.data)

                                    // clientPublicKey + serverPublicKey
                                    console.log([res.salt, x25519BytesToPem(clientPublicKey), res.publicKey])
                                    const message = concatBytes(res.salt, Buffer.from(x25519BytesToPem(clientPublicKey)), Buffer.from(res.publicKey))
                                    const isValid = ed25519.verify(res.verifyMessage, message, serverLongPublicKey)
                                    if (!isValid) {
                                        console.error('[Client] Server verification failed')
                                        return
                                    }
                                    console.log('[Client] Server verified!')

                                    session.sendSeq = 0
                                    session.recvSeq = -1

                                    // 计算共享密钥
                                    const sharedSecret = x25519.getSharedSecret(clientPrivateKey, pemToEd25519Bytes(res.publicKey))
                                    // 派生对称密钥
                                    const salt = res.salt;
                                    const clientToServerKey = hkdf(sha256, sharedSecret, salt, Buffer.from('client-to-server'), 32)
                                    const serverToClientKey = hkdf(sha256, sharedSecret, salt, Buffer.from('server-to-client'), 32)
                                    session.keyClientToServer = clientToServerKey.buffer
                                    keyServerToClient = serverToClientKey

                                    sharedSecret.fill(0)

                                    // 启动心跳
                                    const id = setInterval(() => {
                                        const pingPkg = Package.fromObject({
                                            method_id: Methods.Ping_Request,
                                            flags: 0,
                                            data: LingCatProto.methods.Ping_Request.encode({ time: Date.now() }).finish()
                                        });
                                        sendPackage(pingPkg, { forceEncrypt: true });
                                    }, 10000);
                                    client.addEventListener('close', () => clearInterval(id));
                                    break;
                                }
                                case Methods.Ping_Response: {
                                    const pong = LingCatProto.methods.Ping_Response.decode(mPackage.data);
                                    console.log('[Client] Server recv time:', pong.usage + 'ms');
                                    break;
                                }
                            }
                            on_package_listeners.forEach(v => v(mPackage));
                        } catch (e) {
                            console.error(e);
                        }
                    }
                });
            });
        }
    }
    disconnect() {
        this.client?.close()
    }
}
