import jwt from 'jsonwebtoken'
import { Code } from 'lingcat-protocol'
import crypto from 'node:crypto'
import { config } from '../config.ts'

export type TokenType = 'access' | 'file_upload'

const secret = config.token_secret ? Buffer.from(config.token_secret) : crypto.randomBytes(16)

export default class TokenManager {
    static signAccessTokenForUser(user_id: string) {
        return jwt.sign({
            user_id,
            type: 'access',
        }, secret, {
            expiresIn: '30d',
        })
    }
    static signFileUploadTokenForUser(user_id: string) {
        return jwt.sign({
            user_id,
            type: 'file_upload',
            file_id: crypto.randomUUID(),
        }, secret, {
            expiresIn: '1h',
        })
    }

    static verifyTokenAndGetUserId(token: string, type: TokenType, user_id?: string) {
        try {
            const t = jwt.verify(token, secret) as { user_id: string, type: TokenType }
            if (t.user_id != user_id && user_id != null)
                throw "需要验证用户, 但用户 ID 与令牌不配对!"
            if (t.type != type)
                throw "令牌类型不匹配! 期待 " + type + ", 得到 " + t.type
            return t.user_id
        } catch (e) {
            throw {
                message: '令牌错误!',
                cause: e,
                code: Code.UnAuthorized,
            }
        }
    }
}
