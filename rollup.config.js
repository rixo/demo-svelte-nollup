const svelte = require('rollup-plugin-svelte')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const livereload = require('rollup-plugin-livereload')
const { terser } = require('rollup-plugin-terser')
const staticFiles = require('rollup-plugin-static-files')

const svelteHmr = require('rollup-plugin-svelte-hmr')

const production = process.env.NODE_ENV === 'production'

const hot = !production

module.exports = {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    dir: 'dist',
    entryFileNames: '[name].[hash].js',
    assetFileNames: '[name].[hash][extname]',
  },
  plugins: [
    // NOTE needs to be before svelte(...) because we intend to overwrite
    // public/bundle.css stub -- my guess is there is a better way to handle
    // css, any suggestion welcome
    production &&
      staticFiles({
        include: ['./public'],
      }),

    svelte({
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file — better for performance
      ...(!hot && {
        css: css => css.write('dist/bundle.css'),
      })
    }),

    svelteHmr({ hot }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve({
      browser: true,
      dedupe: importee =>
        importee === 'svelte' || importee.startsWith('svelte/'),
    }),
    commonjs(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && !hot && livereload('public'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production &&
      terser({
        compress: {
          global_defs: {
            module: false,
          },
        },
      }),
  ],
  watch: {
    clearScreen: false,
  },
}
