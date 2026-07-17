import LingCatClient, { UserApi } from 'lingcat-client-protocol'
import fs from './fs.ts'
import { IUser } from 'lingcat-protocol'
import ProfileCache from './ProfileCache.ts'

export default class ClientManager {
    static client: LingCatClient

    static me: IUser
    static async getMe() {
        if (this.me == null) {
            this.me = await UserApi.queryMyUserInfo(this.client, {
                access_token: this.getActiveUserSession().token,
            })
            ProfileCache.user_info[this.me.id] = this.me
        }
        return this.me
    }
    static listServerPublicKeys() {
        return fs.readdirSync('/public_keys')
    }
    static listUserSessions() {
        return fs.readdirSync('/sessions')
    }
    static setServerPublicKey(name: string, data: Uint8Array) {
        fs.writeFileSync('/public_keys/' + name, data)
    }
    static removeServerPublicKey(name: string) {
        fs.unlinkSync('/public_keys/' + name)
    }
    static getServerPublicKey(name: string) {
        return fs.readFileSync('/public_keys/' + name)
    }
    static setUserSession(name: string, token: string, server: string) {
        fs.writeFileSync('/sessions/' + name, JSON.stringify({
            server,
            token,
        }))
    }
    static removeUserSession(name: string) {
        fs.unlinkSync('/sessions/' + name)
    }
    static getActiveUserSession() {
        return this.getUserSession(this.getActiveUserSessionName()!)
    }
    static getUserSession(name: string) {
        return JSON.parse(fs.readFileSync('/sessions/' + name).toString('utf-8')) as {
            token: string,
            server: string,
        }
    }
    static setActiveUserSessionName(userSessionName: string) {
        fs.writeFileSync('/active_session', userSessionName)
    }
    static removeActiveUserSession() {
        fs.unlinkSync('/active_session')
    }
    static getActiveUserSessionName() {
        try {
            return fs.readFileSync('/active_session').toString('utf-8')
        } catch (e) {
            return undefined
        }
    }
    static initClient(userSessionName: string) {
        const { server } = this.getUserSession(userSessionName)
        this.client = new LingCatClient({
            server_ws: server,
            server_http: server,
            server_public_key: this.getServerPublicKey(new URL(server).host)
        })
        this.client.init()
    }
}