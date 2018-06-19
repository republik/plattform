import { renderStaticOptimized } from 'glamor/server'

export const getHtml = (parentElement) => {
  const { html, rules } = renderStaticOptimized(() => {
    return parentElement.innerHTML
  })

  // filter out global rules
  const css = rules.map(x => x.cssText).filter(cssText => {
    return cssText.match(/css-([a-zA-Z0-9\-_]+)/gm)
  }).join('')

  return `<style>${css}</style>\n${html}`
}
