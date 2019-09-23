const path = require('path')
const { createFilter } = require('rollup-pluginutils')

const hotApi = path.resolve(`${__dirname}/runtime/hot-api.js`)

const posixify = file => file.replace(/[/\\]/g, '/')

const quote = JSON.stringify

const aliases = {
  'svelte-hmr/hot-api': hotApi,
}

const svelteHmr = ({ hot = true, hotOptions = {} } = {}) => {
  const filter = createFilter('**/*.svelte', [])

  const options = JSON.stringify(hotOptions)

  const compileData = 'undefined' // TODO

  function transform(code, id) {
    if (!hot) return
    if (!filter(id)) return

    this.addWatchFile(hotApi)

    const replacement = `
      import * as __ROLLUP_PLUGIN_SVELTE_HMR from 'svelte-hmr/hot-api'
      if (module.hot) {
        const { applyHMR } = __ROLLUP_PLUGIN_SVELTE_HMR
        $2 = applyHMR(
          ${options},
          ${quote(id)},
          module,
          $2,
          undefined,
          ${compileData}
        );
      }
      export default $2;
    `
    const transformed = code.replace(/(export default ([^;]*));/, replacement)

    return transformed
  }

  return {
    resolveId: source => aliases[source],
    transform,
  }
}

module.exports = svelteHmr
