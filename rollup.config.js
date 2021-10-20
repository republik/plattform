import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { babel } from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'
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
    resolve(),
    /*typescript({ tsconfig: './tsconfig.json' }),*/
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    }),
    commonjs(),
    css(),
    // terser(),
    fileSize()
  ],
  external: [
    'd3-array',
    'd3-color',
    'd3-dsv',
    'd3-format',
    'd3-geo',
    'd3-scale',
    'd3-shape',
    'd3-time',
    'd3-time-format',
    'downshift',
    'glamor',
    'isomorphic-unfetch',
    'lodash',
    'mdast-react-render',
    'prop-types',
    'react',
    'react-maskedinput',
    'react-textarea-autosize',
    'scroll-into-view',
    'topojson'
  ]
}
