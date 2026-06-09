import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { base_data_path } from '../server/config.ts'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import fs from 'node:fs'
import node_path from 'node:path'

const path = base_data_path + '/page'

try {
    fs.unlinkSync(path)
} catch(e) {}

export default defineConfig({
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
    ],
    build: {
        sourcemap: true,
        outDir: path,
    },
})
