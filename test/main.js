import createLingCatServer from 'lingcat-server'
import { base_data_path } from '../server/config.ts'
createLingCatServer(base_data_path).httpServer.listen(3601)

import LingCatClient from 'lingcat-client-protocol'
import fs from 'node:fs'
import { LingCatProto, Methods, Package } from 'lingcat-protocol'


const client = new LingCatClient({
    server_ws: 'ws://localhost:3601/',
    server_public_key: fs.readFileSync('./lingcat_data/key/public')
})
client.init()

setTimeout(async () => {
    p = Package.encode({
        method_id: Methods.User_Registration_Request,
        flags: 0,
        data: LingCatProto.methods.User_Registration_Request.encode({
            password: 'test',
            nickname: 'Moon',
        }).finish(),
    }).encrypt(client.session.sendSeq++, client.session.keySend)
}, 1000)

let p

setTimeout(async () => {
    console.log(
        await client.invoke_internal({
            mPackage: p,
            timeout: 100000,
        })
    )
}, 2000)

// 重放测试
setTimeout(async () => {
    console.log(
        await client.invoke_internal({
            mPackage: p,
            timeout: 100000,
        })
    )
}, 2500)


/* console.log(
    await UserDataBase.createUser({
        nickname: '满月',
        // username: 'moonleaf'
    })
) */
