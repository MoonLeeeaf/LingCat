import fs from 'node:fs'
import { fileExists, mkdir } from 'lingcat-shared'
import crypto from 'node:crypto'

export const base_data_path = (process.argv.join().indexOf('vite') != -1) ? '../lingcat_data' : './lingcat_data'

mkdir(base_data_path)
mkdir(base_data_path + '/db')

if (!fileExists(base_data_path + '/config.json'))
    fs.writeFileSync(base_data_path + '/config.json', JSON.stringify({
        port: 3601,
        token_secret: crypto.randomBytes(16).toString('utf-8')
    }))

export let config: {
    port?: number,
    hostname?: string,
    token_secret?: string,
} = {}
try {
    config = JSON.parse(fs.readFileSync(base_data_path + '/config.json', 'utf8'))
} catch (e) {
    console.log(e)
}
