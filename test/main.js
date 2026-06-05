import createLingCatServer from 'lingcat-server'

createLingCatServer().httpServer.listen(3601)

import LingCatClient from 'lingcat-client-protocol'
import fs from 'node:fs'
import { LingCatProto, Methods } from 'lingcat-protocol'

const client = new LingCatClient({
    server_ws: 'ws://localhost:3601/',
    server_public_key: fs.readFileSync('./_data/key/public', 'utf-8')
})
client.init()

setTimeout(async () => {
    console.log(
        await client.invoke({
            method_id: Methods.User_Registration_Request,
            data: LingCatProto.methods.User_Registration_Request.encode({
                password: 'test',
                nickname: 'Moon',
            }).finish(),
            timeout: 100000,
        })
    )
}, 2000)

/* console.log(
    await UserDataBase.createUser({
        nickname: '满月',
        // username: 'moonleaf'
    })
) */
