import commonjs from '@rollup/plugin-commonjs'
import { babel } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import fileSize from 'rollup-plugin-filesize'
import css from 'rollup-plugin-import-css'

import pkg from './package.json'

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [
    peerDepsExternal(),
    nodeResolve(),
    babel({ babelHelpers: 'bundled', configFile: true }),
    css(),
    commonjs({ extensions: ['.js', '.ts'] }),
    /*typescript({ tsconfig: './tsconfig.json' }),*/
    fileSize()
  ],

  external: ['react', 'react-dom']
}
