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
import sendError from './api/sendError.ts'
import FileApi from './api/FileApi.ts'
import cookieParser from 'cookie-parser'

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

    app.use(cookieParser())
    app.get('/uploaded_files/:hash', async (req, res) => {
        const token = req.headers.file_access_token || req.cookies.file_access_token
        if (!token) return res.status(401).send({ message: "Unauthorzied" })

        try {
            const user_id = (await TokenManager.verifyFileAccessToken(token as string)).user_id

            const file = await FileManager.queryFileByHash(req.params.hash as string)
            if (file == null) return res.status(404).send({ message: "Not Found" })

            if (file.belong_to_chat_id && await UserChatLinker.isUserChatLinked(user_id, file.belong_to_chat_id))
                return res.status(403).send({ message: "This file belongs to a chat you have no access" })

            res.setHeader('Content-Disposition', `inline; filename="${file.uploaded_at}"`)
            res.setHeader('Content-Type', file.mime)
            res.sendFile(node_path.resolve(FileManager.getFilePath(file.hash)))

            await FileManager.updateLastUsedTime(file.hash)
        } catch (e) {
            return res.status(401).send({ message: "Token is invalid", cause: JSON.stringify(e) })
        }
    })
    app.post('/upload_file', async (req, res) => {
        const token = req.headers.token
        if (!token) return res.status(401).send({ message: "Unauthorzied" })

        try {
            await TokenManager.verifyFileUploadToken(token as string)
        } catch (e) {
            return res.status(401).send({ message: "Token is invalid" })
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
            /*
            if (!hash_from_client) {
                return res.status(400).send({ message: "Missing client hash" })
            }
             */
            if (hash_from_client && hash != hash_from_client) {
                if (fs.existsSync(path)) {
                    fs.unlinkSync(path)
                }
                return res.status(400).send({ message: "Hash mismatch" })
            }
            try {
                await FileManager.uploadFile(hash!, fileName, path, belong_to_chat_id)
            } finally {
                fs.unlinkSync(path)
            }

            res.status(200).send({
                message: "success",
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

    wsServer.on('connection', async (client, req) => {
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
                console.log("[收]", req.socket.remoteAddress, "Method:", Methods.getMethodName(mPackage.method_id), "| Flags:", mPackage.flags, "| Data length:", mPackage.length, '| Request ID:', mPackage.request_id, (isEncrypted ? ("(Encrypted, recvSeq: " + recvSeq + ", current sendSeq: " + sendSeq + ") ") : ''))

                // 如果是加密消息, 同时应该返回加密的消息
                function sendPackage(p: Package, option?: { forceEncrypt: boolean }) {
                    p.request_id = mPackage.request_id
                    client.send((isEncrypted || option?.forceEncrypt ? p.encrypt(sendSeq++, keySend!) : p).toBuffer())
                    console.log("[发]", req.socket.remoteAddress, "Method:", Methods.getMethodName(p.method_id), "| Flags:", p.flags, "| Data length:", p.length, '| Request ID:', p.request_id, (isEncrypted ? ("(Encrypted, recvSeq: " + recvSeq + ", current sendSeq: " + sendSeq + ") ") : ''))
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
                    if (!(await ServerApi.onCall(sendPackage, mPackage) || await UserApi.onCall(sendPackage, mPackage) || await FileApi.onCall(sendPackage, mPackage))) {
                        console.log('[Server] Method not found:', mPackage.method_id)
                        sendError(sendPackage, mPackage.method_id, 'Method not found', Code.Not_Found)
                    }
                } catch (e) {
                    console.log('[Server] Error: ', e)
                    if (e.message && e.code)
                        sendError(sendPackage, mPackage.method_id, e.message + ' (' + e.cause + ')', e.code)
                    else
                        sendError(sendPackage, mPackage.method_id, e + '', Code.Internal_Server_Error)
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
