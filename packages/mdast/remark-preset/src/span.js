import * as zone from './zone'

import decodeEntities from 'parse-entities'
import encodeEntities from 'stringify-entities'

export const collapse = zone.collapse({
  test: ({type, value}) => {
    if (type !== 'html') {
      return
    }
    if (value.match(/^<span[^>]*>/)) {
      return 'start'
    }
    if (value === '</span>') {
      return 'end'
    }
  },
  mutate: (start, nodes, end) => {
    const data = {}
    const dataAttrs = start.value.match(/data-([^=]+)="([^"]+)"/g) || []
    dataAttrs.forEach(d => {
      const [key, value] = d.split('=')
      data[
        decodeEntities(key.replace(/^data-/, ''))
      ] = decodeEntities(value.slice(1, -1))
    })
    return {
      type: 'span',
      data,
      children: nodes
    }
  }
})

export const expand = zone.expand({
  test: ({type}) => type === 'span',
  mutate: node => [
    {
      type: 'html',
      value: `<span${node.data
        ? ' ' + Object.keys(node.data).map(key => {
          if (typeof node.data[key] !== 'string') {
            throw new Error('mdast span: only stings are supported, you may use JSON.stringify')
          }
          return `data-${encodeEntities(key)}="${encodeEntities(node.data[key])}"`
        }).join(' ')
        : ''}>`
    },
    ...node.children,
    {
      type: 'html',
      value: '</span>'
    }
  ]
})
