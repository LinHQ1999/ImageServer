import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    base: "/app/",
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
