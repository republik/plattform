import { defineConfig } from 'tsup'

const config = defineConfig({
  entryPoints: ['src/lib.ts', 'src/editor.ts', 'src/chart.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  target: 'es6',
  external: ['react', 'react-dom'],
  outDir: 'dist',
  loader: {
    '.js': 'jsx',
  },
})

export default config
