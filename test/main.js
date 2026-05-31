import createLingCatServer from 'lingcat-server'

createLingCatServer().httpServer.listen(3601)

import LingCatClient from 'lingcat-client-protocol'
import fs from 'node:fs'
import UserDataBase from '../server/data/UserDataBase.ts'
import { LingCatProto, Methods } from 'lingcat-protocol'

const client = new LingCatClient({
    server_ws: 'ws://localhost:3601/',
    server_public_key: fs.readFileSync('./_data/key/public', 'utf-8')
})
client.connect()

setTimeout(async () => {
    console.log(
        "Request Successfully",
        await client.invoke({
            method_id: Methods.Ping_Request,
            data: LingCatProto.methods.Ping_Request.encode({ time: Date.now() }).finish(),
        })
    )
}, 2000)

/* console.log(
    await UserDataBase.createUser({
        nickname: '满月',
        // username: 'moonleaf'
    })
) */
