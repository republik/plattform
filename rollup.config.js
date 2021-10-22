import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { babel } from '@rollup/plugin-babel'
import fileSize from 'rollup-plugin-filesize'
import typescript from 'rollup-plugin-typescript2'

import pkg from './package.json'

export default {
  input: './src/lib.ts',
  output: [
    {
      dir: 'dist/cjs/src',
      preserveModules: true,
      preserveModulesRoot: 'src',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    {
      dir: 'dist/esm/src',
      preserveModules: true,
      preserveModulesRoot: 'src',
      format: 'esm',
      sourcemap: true,
      exports: 'named'
    }
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    typescript({
      tsconfig: './tsconfig.json',
      useTsconfigDeclarationDir: true
    }),
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
    'react-dom',
    'react-maskedinput',
    'react-textarea-autosize',
    'scroll-into-view',
    'topojson'
  ]
}
