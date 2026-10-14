import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { base_data_path, config } from "../server/config.ts"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import fs from "node:fs"

const path = base_data_path + "/page"

try {
  fs.rmSync(path, { recursive: true, force: true })
} catch (e) {}

//   ''          → '/'
//   '/lingcat'  → '/lingcat/'
//   '/lingcat/' → '/lingcat/'
const basePath = (config.base_path || '').replace(/\/+$/, '')
const viteBase = basePath + '/'

export default defineConfig({
  base: viteBase,
  plugins: [
    react(),
    nodePolyfills({
      include: ["crypto", "stream", "vm"],
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
    rolldownOptions: {
      // 不变
    },
  },
})