import createLingCatServer from 'lingcat-server'

createLingCatServer().httpServer.listen(3601)

import LingCatClient from 'lingcat-client-protocol'
import fs from 'node:fs'

const client = new LingCatClient({
    server_ws: 'ws://localhost:3601/',
    server_public_key: fs.readFileSync('./_data/key/public', 'utf-8')
})
client.connect()
