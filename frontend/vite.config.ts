import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    base: "/app/",
    build: {
        outDir: "../statics",
        emptyOutDir: true
    },
    server: {
        open: true,
        proxy: {
            "/api": "http://localhost:9080",
            "/pics": "http://localhost:9080"
        }
    },
    plugins: [
        react()
    ]
})
