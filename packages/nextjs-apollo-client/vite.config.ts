import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

module.exports = defineConfig({
  plugins: [react(), dts({ insertTypesEntry: true })],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'NextjsApolloClient',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['@apollo/client', 'next', 'react', 'react-dom', 'uuid'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          '@apollo/client': 'ApolloClient',
          next: 'next',
          react: 'React',
          'react-dom': 'ReactDOM',
          'uuid/v4': 'uuid',
        },
      },
    },
  },
})
