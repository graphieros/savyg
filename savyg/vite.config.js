import { resolve } from "path"
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
    plugins: [
        dts({
            insertTypesEntry: true
        })
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'savyg',
            fileName: 'savyg',
            formats: [ 'es', 'cjs', 'umd', 'iife']
        }
    }
})