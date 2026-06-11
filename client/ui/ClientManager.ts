import fs from '../fs.ts'

export default class ClientManager {
    static listServerPublicKeys() {
        return fs.readdirSync('/public_keys')
    }
    static getServerPublicKey(name: string) {
        return fs.readFileSync('/public_keys/' + name).toString('utf-8')
    }
}