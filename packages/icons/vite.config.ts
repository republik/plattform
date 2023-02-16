import { defineConfig } from 'vite'
import path from 'path'
import glob from 'glob'
import { fileURLToPath } from 'url'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

// Generate entry points to bundle all icons from the svg-folder
// While providing a separate entry point for each sub-folder as well.
const entryObject = Object.fromEntries(
  glob
    .sync(path.resolve(__dirname, 'lib/components') + '/**/index.ts')
    .map((file) => [
      // This remove `src/` as well as the file extension from each
      // file, so e.g. src/nested/foo.js becomes nested/foo
      path.relative(
        'lib',
        file.slice(0, file.length - path.extname(file).length),
      ),
      // This expands the relative paths to absolute paths, so e.g.
      // src/nested/foo becomes /project/src/nested/foo.js
      fileURLToPath(new URL(file, import.meta.url)),
    ])
    .map((keyVal) => {
      console.log(keyVal)
      const key = keyVal[0]
        .replace(/components\//, '')
        .replace(/\/index$/, '')
        // Transform 'md/md' to 'mdMd'
        .replace(/\/[a-zA-Z0-9]{1}/, (chars) => chars[1].toUpperCase())

      return [
        key.length === 0 ? 'index' : key, // special case for root index.ts
        keyVal[1],
      ]
    }),
)

console.log('entryObject', entryObject)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      outputDir: 'dist/types',
    }),
  ],
  build: {
    lib: {
      entry: entryObject,
      name: 'RepublikIcons',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
  },
})
