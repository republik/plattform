import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/lib.ts', 'src/editor.ts', 'src/chart.ts'],
  outDir: 'dist',
  format: ['cjs', 'esm'],
  experimentalDts: true,
  loader: {
    '.js': 'jsx',
  },
})
