import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { base_data_path } from '../server/config.ts'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import fs from 'node:fs'
import node_path from 'node:path'

const path = base_data_path + '/page'

const default_public_key_path = base_data_path + '/key/public'

try {
    fs.rmSync(path, { recursive: true, force: true })
} catch(e) {}

function publicKeyPlugin() {
    return {
        name: 'public-key-plugin',
        config() {
            return {
                define: {
                    __PUBLIC_KEY__: JSON.stringify(fs.readFileSync(default_public_key_path, 'hex'))
                }
            }
        }
    }
}

export default defineConfig({
    base: './',
    plugins: [
        react(),
        nodePolyfills({
            include: ['crypto', 'stream', 'vm'],
            globals: {
                Buffer: true,
                global: true,
                process: true,
            },
        }),
        publicKeyPlugin(),
    ],
    build: {
        sourcemap: true,
        outDir: path,
    },
})
