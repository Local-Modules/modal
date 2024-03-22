import builtins from 'builtin-modules/static'
import typescript from '@rollup/plugin-typescript'
import babel from '@rollup/plugin-babel'
import json from '@rollup/plugin-json'

import pkg from './package.json'


// const extensions = [ '.ts' ]
// const babelRuntimeVersion = pkg.dependencies['@babel/runtime'].replace(/^[^0-9]*/, '')

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
    chunkFileNames: '[name].js',
    compact: true,
  },
  external: [
    ...builtins,
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    json(),
    babel({
      exclude: 'node_modules/**',
    }),
    typescript({
      tsconfig: './tsconfig.json',
    }),
    // uglify(),
  ],
}
