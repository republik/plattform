import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { babel } from '@rollup/plugin-babel'
import fileSize from 'rollup-plugin-filesize'
import typescript from '@rollup/plugin-typescript'

import pkg from './package.json'

export default [
  {
    input: './src/lib.js',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true
      },
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true
      }
    ]
  },
  {
    input: './src/chart.js',
    output: [
      {
        file: './dist/chart.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: './dist/chart.esm.js',
        format: 'esm',
        sourcemap: true
      }
    ]
  },
  {
    input: './src/icons.js',
    output: [
      {
        file: './dist/icons.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: './dist/icons.esm.js',
        format: 'esm',
        sourcemap: true
      }
    ]
  }
].map(config => ({
  input: config.input,
  output: config.output,
  plugins: [
    peerDepsExternal(),
    resolve(),
    typescript({ tsconfig: './tsconfig.json' }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    }),
    commonjs(),
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
}))
