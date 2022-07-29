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
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [nodeResolve({ preferBuiltins: true }), dts()],
  },
]
