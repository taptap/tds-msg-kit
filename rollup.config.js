import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
const { terser } = require('rollup-plugin-terser');

const plugins = (tsConfig) => [
  nodeResolve(),
  commonjs(),
  typescript({
    tsconfig: 'tsconfig.json',
    ...tsConfig,
    typescript: require('typescript'),
  }),
  babel({ babelHelpers: 'runtime', extensions: ['.js', '.ts'] }),
];

function createBrowser(name, windowName) {
  return [
    {
      input: `src/${name}.ts`,
      plugins: plugins({
        outDir: 'dist',
        declaration: true,
        declarationDir: 'dist',
      }).concat(terser({ compress: true, mangle: true })),
      output: [
        {
          format: 'umd',
          name: windowName,
          sourcemap: true,
          file: `dist/${windowName}.umd.min.js`,
        },
        {
          format: 'iife',
          name: windowName,
          sourcemap: true,
          file: `dist/${windowName}.iife.min.js`,
        },
      ],
    },
    {
      input: `src/${name}.ts`,
      plugins: plugins({
        outDir: 'dist',
        declaration: true,
        declarationDir: 'dist',
      }),
      output: [
        {
          format: 'umd',
          name: windowName,
          sourcemap: true,
          file: `dist/${windowName}.umd.js`,
        },
        {
          format: 'iife',
          name: windowName,
          sourcemap: true,
          file: `dist/${windowName}.iife.js`,
        },
      ],
    },
  ];
}

module.exports = [
  ...createBrowser('client', 'TdsClient'),
  ...createBrowser('server', 'TdsServer'),
];
