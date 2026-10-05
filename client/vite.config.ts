import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { base_data_path } from "../server/config.ts";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import fs from "node:fs";
// import { viteSingleFile } from 'vite-plugin-singlefile'

const path = base_data_path + "/page";

const default_public_key_path = base_data_path + "/key/public";

try {
  fs.rmSync(path, { recursive: true, force: true });
} catch (e) {}

function publicKeyPlugin() {
  return {
    name: "public-key-plugin",
    config() {
      return {
        define: {
          __PUBLIC_KEY__: JSON.stringify(
            fs.readFileSync(default_public_key_path, "hex"),
          ),
        },
      };
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [
    // viteSingleFile(),
    react(),
    nodePolyfills({
      include: ["crypto", "stream", "vm"],
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
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "mdui-vendor",
              test: /[\\/]node_modules[\\/](mdui|@mdui)[\\/]/,
              priority: 40,
            },
            {
              name: "react-vendor",
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|zustand)[\\/]/,
              priority: 30,
            },
            {
              name: "livekit-vendor",
              test: /[\\/]node_modules[\\/](livekit-client)[\\/]/,
              priority: 25,
            },
            {
              name: "zenfs-vendor",
              test: /[\\/]node_modules[\\/](@zenfs[\\/]core|@zenfs[\\/]dom)[\\/]/,
              priority: 20,
            },
            {
              name: "vendor",
              test: /[\\/]node_modules[\\/]/,
              priority: 5,
              maxSize: 400000,
            },
          ],
        },
      },
    },
  },
});
