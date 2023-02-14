import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),    
  ],
  build: {
    lib: {
      entry: [
        resolve(__dirname, 'lib/components/index.ts'),
        resolve(__dirname, 'lib/components/md/index.ts'),
        resolve(__dirname, 'lib/components/hr/index.ts'),
      ],
      name: "RepublikIcons",
      fileName: 'republik-icons',
    },
    rollupOptions: {
      external: ['react'],
      output: {
        globals: {
          react: 'React',
        },
      },
    }
  }
})
