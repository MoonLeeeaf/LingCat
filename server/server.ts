import { WebSocketServer } from 'ws'
import express from 'express'
import http from 'node:http'
import { Package, Methods, LingCatProto, Code, SecureKey } from 'lingcat-protocol'
import fs from 'node:fs'
import { fileExists, mkdir, toUint8Array } from 'lingcat-shared'
import fileUpload from 'express-fileupload'
import UserApi from './api/UserApi.ts'
import ServerApi from './api/ServerApi.ts'
import { randomSha256Salt } from '../protocol/SecureKey.ts'

export default function createLingCatServer(base_data_path: string) {
    const app = express()
    const httpServer = http.createServer(app)
    const wsServer = new WebSocketServer({
        server: httpServer,
    })

    app.use(express.static(`${base_data_path}/page/`))
    app.use(fileUpload({
        limits: { fileSize: 2 * 1024 * 1024 * 1024 },
        useTempFiles: true,
        tempFileDir: base_data_path + '/upload_cache',
        abortOnLimit: true,
    }))
    app.post('/upload_file', (req, res, next) => {
        const file = req.files?.file as fileUpload.UploadedFile
        if (file?.data == null) {
            res.status(400).send({
                msg: "No file was found or multiple files were uploaded",
            })
            return
        }
        if (req.body.file_name == null) {
            res.status(400).send({
                msg: "Filename is required",
            })
            return
        }
        next()
    }, (req, res) => {
        const file = req.files?.file as fileUpload.UploadedFile

        res.status(200).send({
            msg: "success",
            // file_hash: '',
        })
    })


    if (!fileExists(`${base_data_path}/key/`)) {
        console.log('[Server]', '生成服务端密钥...')
        mkdir(`${base_data_path}/key`)
        const keyPair = SecureKey.Server_generateLongTermKeyPair()
        fs.writeFileSync(`${base_data_path}/key/public`, keyPair.publicKey)
        fs.writeFileSync(`${base_data_path}/key/private`, keyPair.privateKey)
    }

    console.log('[Server]', '服务端公钥 Hex:', fs.readFileSync(`${base_data_path}/key/public`).toString('hex'))

    wsServer.on('connection', async (client) => {
        const keyPair = SecureKey.All_generateExchangeKeyPair()
        const privateKey = fs.readFileSync(`${base_data_path}/key/private`)
        let keySend: Uint8Array | undefined
        let keyRecv: Uint8Array | undefined

        let sendSeq = -1
        let recvSeq = -1

        client.on('close', () => {
            if (keySend) {
                new Uint8Array(keySend).fill(0)
            }
            if (keySend) {
                new Uint8Array(keySend).fill(0)
            }
        })

        client.on('message', async (data, isBinary) => {
            if (!isBinary) return
            try {
                let mPackage = Package.decode(toUint8Array(data), keyRecv, recvSeq)

                recvSeq = mPackage.seq

                const isEncrypted = mPackage.isDecrypted
                console.log("[Server] " + (isEncrypted ? ("(Encrypted, recvSeq: " + recvSeq + ", current sendSeq: " + sendSeq + ") ") : '') + "Method:", Methods.getMethodName(mPackage.method_id), "| Flags:", mPackage.flags, "| Data length:", mPackage.length, '| Request ID:', mPackage.request_id)

                // 如果是加密消息, 同时应该返回加密的消息
                function sendPackage(p: Package, option?: { forceEncrypt: boolean }) {
                    p.request_id = mPackage.request_id
                    client.send((isEncrypted || option?.forceEncrypt ? p.encrypt(sendSeq++, keySend!) : p).toBuffer())
                }

                try {
                    switch (mPackage.method_id) {
                        // 握手请求
                        case Methods.HandShake_Request: {
                            // 计算共享秘密
                            const clientPublicKey = Buffer.from(
                                LingCatProto.methods.HandShake_Request.decode(mPackage.data).clientPublicKey
                            )
                            let sharedSecret = SecureKey.All_getSharedSecret(
                                clientPublicKey,
                                keyPair.privateKey
                            )

                            // 生成盐值, 并签名交由客户端进行验证
                            const salt = randomSha256Salt()

                                // 与客户端交互所需要的对称密钥
                                ; ({ keyRecv, keySend } = SecureKey.Server_hkdf(sharedSecret, salt))
                            sharedSecret.fill(0)

                            sendSeq = 0
                            recvSeq = -1

                            sendPackage(Package.encode({
                                method_id: Methods.HandShake_Response,
                                flags: 0,
                                data: LingCatProto.methods.HandShake_Response.encode({
                                    salt,
                                    serverPublicKey: keyPair.publicKey,
                                    messageToBeVerify: SecureKey.Server_signCheckMessage(
                                        keyPair.publicKey,
                                        clientPublicKey,
                                        privateKey
                                    )
                                }).finish()
                            }))
                            return
                        }
                    }

                    // 若没有一个命中, 则报 Not_Found 错误
                    if (!(await ServerApi.onCall(sendPackage, mPackage) || await UserApi.onCall(sendPackage, mPackage))) {
                        sendPackage(Package.encode({
                            method_id: Methods.Error_Response,
                            flags: 0,
                            data: LingCatProto.methods.Error_Response.encode({
                                requestMethod: mPackage.method_id,
                                code: Code.Not_Found,
                            }).finish()
                        }))
                    }
                } catch (e) {
                    console.log('[Server] Error: ', e)
                    if (e.message && e.code)
                        sendPackage(Package.encode({
                            method_id: Methods.Error_Response,
                            flags: 0,
                            data: LingCatProto.methods.Error_Response.encode({
                                requestMethod: mPackage.method_id,
                                message: e.message + ' (' + e.cause + ')',
                                code: e.code,
                            }).finish()
                        }))
                    else
                        sendPackage(Package.encode({
                            method_id: Methods.Error_Response,
                            flags: 0,
                            data: LingCatProto.methods.Error_Response.encode({
                                requestMethod: mPackage.method_id,
                                message: e + '',
                                code: Code.Internal_Server_Error,
                            }).finish()
                        }))
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
