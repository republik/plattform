import { exec } from 'node:child_process'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/lib.ts', 'src/editor.ts', 'src/chart.ts'],
  outDir: 'dist',
  format: ['cjs', 'esm'],
  loader: {
    '.js': 'jsx',
  },
  // We want declaration maps, see https://tsup.egoist.dev/#generate-typescript-declaration-maps--d-ts-map
  onSuccess: async () => {
    console.log('Generating TypeScript declaration files ...')
    await new Promise<void>((resolve, reject) => {
      exec('tsc --emitDeclarationOnly --declaration', (err, stdout, stderr) => {
        if (err) {
          console.error(stderr)
          reject(err)
        }
        console.log(stdout)
        resolve()
      })
    })
    console.log('⚡ TypeScript declaration files generated')
  },
})
