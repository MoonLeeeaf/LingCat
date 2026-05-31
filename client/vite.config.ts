import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { base_data_path } from '../server/config.ts'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import fs from 'node:fs'

fs.unlinkSync("." + base_data_path + '/page')

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
        outDir: "." + base_data_path + '/page',
    },
})
