// @ts-expect-error plugins is not typed in the latest glamor release
import { plugins } from 'glamor'

/**
 * Modify selectors to be more specific than the base @layer that's generated by the PandaCSS polyfill
 */
function glamorPluginSpecificity({ selector, style }) {
  const newSelector = selector
    .split(',')
    .map((s: string) =>
      s.startsWith(':not(#\\#') || s.startsWith(':root')
        ? s
        : `:not(#\\#app) ${s}`,
    )
    .join(',')

  return { selector: newSelector, style }
}

plugins.add(glamorPluginSpecificity)
