import jwt from 'jsonwebtoken'
import { Code } from 'lingcat-protocol'
import crypto from 'node:crypto'

const secret = crypto.randomBytes(16)

export default class TokenManager {
    static signAccessTokenForUser(user_id: string) {
        jwt.sign({
            user_id,
        }, secret, {
            expiresIn: '30d'
        })
    }
    static verifyToken(token: string, user_id: string) {
        try {
            jwt.verify(token, secret, { user_id })
        } catch (e) {
            throw {
                message: '令牌错误!',
                cause: e,
                code: Code.UnAuthorized,
            }
        }
    }
}
