import { WebSocketServer } from 'ws'
import express from 'express'
import http from 'node:http'
import { Package, Methods, LingCatProto, Code, SecureKey } from 'lingcat-protocol'
import fs from 'node:fs'
import { fileExists, mkdir, toUint8Array } from 'lingcat-shared'
import UserApi from './api/UserApi.ts'
import ServerApi from './api/ServerApi.ts'
import { randomSha256Salt } from '../protocol/SecureKey.ts'
import busboy from 'busboy'
import crypto from 'node:crypto'
import os from 'node:os'
import FileManager from './data/FileManager.ts'
import { config } from './config.ts'
import TokenManager from './api/TokenManager.ts'
import node_path from 'node:path'
import UserChatLinker from './data/UserChatLinker.ts'

export default function createLingCatServer(base_data_path: string) {
    const app = express()
    const httpServer = http.createServer(app)
    const wsServer = new WebSocketServer({
        server: httpServer,
    })

    app.use((req, res, next) => {
        const start = Date.now()

        res.on('finish', () => {
            const duration = Date.now() - start
            console.log(`[HTTP] ${req.socket.remoteAddress} <- ${req.originalUrl} [${res.statusCode}] (with ${req.method}, ${duration}ms)`)
        })

        next()
    })


    app.use(express.static(`${base_data_path}/page/`))
    app.get('/uploaded_files/:hash', async (req, res) => {
        const token = req.headers.token
        if (!token) return res.status(401).send({ msg: "Unauthorzied" })

        try {
            const user_id = (await TokenManager.verifyAccessToken(token as string)).user_id

            const file = await FileManager.queryFileByHash(req.params.hash as string)
            if (file == null) return res.status(404).send({ msg: "Not Found" })

            if (file.belong_to_chat_id && await UserChatLinker.isUserChatLinked(user_id, file.belong_to_chat_id))
                return res.status(403).send({ msg: "This file belongs to a chat you have no access" })

            res.setHeader('Content-Disposition', `inline; filename="${file.uploaded_at}"`)
            res.setHeader('Content-Type', file.mime)
            res.sendFile(node_path.resolve(FileManager.getFilePath(file.hash)))

            await FileManager.updateLastUsedTime(file.hash)
        } catch (e) {
            return res.status(401).send({ msg: "Token is invalid" })
        }
    })
    app.post('/upload_file', async (req, res) => {
        const token = req.headers.token
        if (!token) return res.status(401).send({ msg: "Unauthorzied" })

        try {
            await TokenManager.verifyFileUploadToken(token as string)
        } catch (e) {
            return res.status(401).send({ msg: "Token is invalid" })
        }

        const bb = busboy({ headers: req.headers, limits: { files: 1, fileSize: config.max_file_size || 1000 * 1024 * 1024 } })

        let hash_from_client: string | undefined
        let hash: string | undefined
        let fileName = ''
        let belong_to_chat_id: string | undefined
        const path = os.tmpdir() + '/lingcat-upload-tmp-' + crypto.randomBytes(6).toString('hex')

        bb.on('field', (name, val) => {
            if (name == 'hash') {
                hash_from_client = val
            }
            if (name == 'belong_to_chat_id') {
                belong_to_chat_id = val
            }
        })

        bb.on('file', (_name, file, info) => {
            let size = 0
            const hasher = crypto.createHash('sha256')
            const writeStream = fs.createWriteStream(path)

            fileName = info.filename

            file.on('data', (data) => {
                hasher.update(data)
                writeStream.write(data)
                size += data.length
            }).on('close', () => {
                writeStream.close()
                hash = hasher.digest().toString('hex')
            })
        })

        bb.on('close', async () => {
            if (!hash_from_client) {
                return res.status(400).send({ msg: "Missing client hash" })
            }

            if (hash != hash_from_client) {
                if (fs.existsSync(path)) {
                    fs.unlinkSync(path)
                }
                return res.status(400).send({ msg: "Hash mismatch" })
            }
            try {
                await FileManager.uploadFile(hash, fileName, path, belong_to_chat_id)
            } finally {
                fs.unlinkSync(path)
            }

            res.status(200).send({
                msg: "success",
                file_hash: hash,
            })
        })

        req.pipe(bb)
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

        let user_id_after_authorzied: string | undefined

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
                console.log("[Receive] " + (isEncrypted ? ("(Encrypted, recvSeq: " + recvSeq + ", current sendSeq: " + sendSeq + ") ") : '') + "Method:", Methods.getMethodName(mPackage.method_id), "| Flags:", mPackage.flags, "| Data length:", mPackage.length, '| Request ID:', mPackage.request_id)

                // 如果是加密消息, 同时应该返回加密的消息
                function sendPackage(p: Package, option?: { forceEncrypt: boolean }) {
                    p.request_id = mPackage.request_id
                    client.send((isEncrypted || option?.forceEncrypt ? p.encrypt(sendSeq++, keySend!) : p).toBuffer())
                    console.log("[Send] " + (isEncrypted ? ("(Encrypted, recvSeq: " + recvSeq + ", current sendSeq: " + sendSeq + ") ") : '') + "Method:", Methods.getMethodName(p.method_id), "| Flags:", p.flags, "| Data length:", p.length, '| Request ID:', p.request_id)
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
                        case Methods.Authorize_Request: {
                            user_id_after_authorzied = (await TokenManager.verifyAccessToken(
                                LingCatProto.methods.Authorize_Request.decode(mPackage.data).accessToken
                            )).user_id

                            sendPackage(Package.encode({
                                method_id: Methods.Authorize_Response,
                                flags: 0,
                                data: LingCatProto.methods.Authorize_Response.encode({}).finish()
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
