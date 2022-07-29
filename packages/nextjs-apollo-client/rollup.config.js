import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import dts from 'rollup-plugin-dts'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import { terser } from 'rollup-plugin-terser'
import visualizer from 'rollup-plugin-visualizer'
import bundleSize from 'rollup-plugin-bundle-size'
import path from 'path'

const pkgJSON = require('./package.json')

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkgJSON.module,
        format: 'esm',
      },
      {
        file: pkgJSON.main,
        format: 'cjs',
      },
    ],
    plugins: [
      peerDepsExternal(),
      nodeResolve(),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
        outputToFilesystem: true,
      }),
      commonjs(),
      terser(),
      bundleSize(),
      process.env.ANALYZE === 'true' &&
        visualizer(() => ({
          filename: path.join(__dirname, 'bundle-analysis.html'),
        })),
    ],
    external: Object.keys(pkgJSON.peerDependencies || {}),
  },
  // // disable temporarely since it fails on heroku:
  // // @republik/nextjs-apollo-client:prepare: dist/types/index.d.ts → dist/index.d.ts...
  // // @republik/nextjs-apollo-client:prepare: [!] Error: Could not resolve entry module (dist/types/index.d.ts).
  // // @republik/nextjs-apollo-client:prepare: Error: Could not resolve entry module (dist/types/index.d.ts).
  // // @republik/nextjs-apollo-client:prepare:     at error (/tmp/build_10618700/node_modules/rollup/dist/shared/rollup.js:198:30)
  // // @republik/nextjs-apollo-client:prepare:     at ModuleLoader.loadEntryModule (/tmp/build_10618700/node_modules/rollup/dist/shared/rollup.js:22483:20)
  // // @republik/nextjs-apollo-client:prepare:     at async Promise.all (index 0)
  // {
  //   input: 'dist/types/index.d.ts',
  //   output: [{ file: 'dist/index.d.ts', format: 'esm' }],
  //   plugins: [nodeResolve({ preferBuiltins: true }), dts()],
  // },
]
