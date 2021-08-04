import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import alias from '@rollup/plugin-alias'
import svelte from 'rollup-plugin-svelte'
import { visualizer } from 'rollup-plugin-visualizer'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
import css from 'rollup-plugin-import-css'
import path from 'path'

import {
  preprocess,
  createEnv,
  readConfigFile
} from '@pyoner/svelte-ts-preprocess'

const production = !process.env.ROLLUP_WATCH

const env = createEnv()
const compilerOptions = readConfigFile(env)
const opts = {
  env,
  compilerOptions: {
    ...compilerOptions,
    allowNonTsExtensions: true
  }
}

export default {
  input: 'src/main.ts',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/bundle.js'
  },
  plugins: [
    alias({
      entries: [
        {
          find: '@',
          replacement: path.resolve(__dirname, './src')
        },
        {
          find: '@back',
          replacement: path.resolve(__dirname, '../backend/src')
        }
      ]
    }),
    svelte({
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file — better for performance
      css: css => {
        css.write('public/bundle.css')
      },

      preprocess: preprocess(opts)
    }),

    resolve({
      extensions: ['.js', '.ts']
    }),
    typescript(),
    commonjs(),
    css(),
    // Give stats about the build
    // Size, file etc.
    production && visualizer(),
    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser()
  ]
}
