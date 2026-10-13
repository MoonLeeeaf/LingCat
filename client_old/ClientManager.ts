import LingCatClient, { UserApi } from 'lingcat-client-protocol'
import fs from './fs.ts'
import { IUser } from 'lingcat-protocol'
import ProfileCache from './ProfileCache.ts'
import ClientConfigInstance from './ClientConfig.ts'

const default_server = location.protocol + '//' + location.host + location.pathname

const is_inline = new URL(location.href).protocol == 'file:'

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
        return is_inline ? fs.readdirSync('/public_keys') : [...fs.readdirSync('/public_keys'), '内置']
    }
    static listUserSessions() {
        return fs.readdirSync('/sessions')
    }
    static setServerPublicKey(name: string, data: Uint8Array) {
        if (name == '内置') return
        fs.writeFileSync('/public_keys/' + name, data)
    }
    static removeServerPublicKey(name: string) {
        fs.unlinkSync('/public_keys/' + name)
    }
    static getServerPublicKey(name: string) {
        if (name == '内置') return Buffer.from(__PUBLIC_KEY__, 'hex')
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

        if ('LingCatClientInterface' in window) {
            const { token, server } = this.getActiveUserSession()
            LingCatClientInterface.setCurrentSession(token, server, this.getServerPublicKey(new URL(server).host).toString('hex'))
        }
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
        let { server }: { server?: string } = this.getUserSession(userSessionName)
        if (server.trim() == '')
            server = undefined
        ClientConfigInstance.loadFrom(server || '').catch(() => { })
        this.client = new LingCatClient({
            server_ws: server || default_server,
            server_http: server || default_server,
            server_public_key: this.getServerPublicKey(server ? new URL(server).host : '内置')
        })
        this.client.init()
    }
}


