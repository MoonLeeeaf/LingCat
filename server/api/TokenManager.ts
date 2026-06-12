import jwt from 'jsonwebtoken'
import { Code } from 'lingcat-protocol'
import crypto from 'node:crypto'
import { config } from '../config.ts'

const secret = config.token_secret ? Buffer.from(config.token_secret) : crypto.randomBytes(16)

export default class TokenManager {
    static signAccessTokenForUser(user_id: string) {
        return jwt.sign({
            user_id,
        }, secret, {
            expiresIn: '30d'
        })
    }
    static verifyToken(token: string, user_id: string) {
        try {
            const t = jwt.verify(token, secret) as { user_id: string }
            if (t.user_id != user_id)
                throw "用户 ID 与令牌不配对!"
        } catch (e) {
            throw {
                message: '令牌错误!',
                cause: e,
                code: Code.UnAuthorized,
            }
        }
    }
}
