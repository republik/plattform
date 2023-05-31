import unified from 'unified'
import remarkStringify from 'remark-stringify'
import frontmatter from 'remark-frontmatter'

import * as zone from './zone'
import * as meta from './meta'
import * as span from './span'
import * as tag from './tag'

const stringifier = unified()
  .use(remarkStringify, {
    bullet: '*',
    fences: true,
  })
  .use(frontmatter, ['yaml'])
  .use(meta.format)
  .use(
    zone.expand({
      test: ({ type }) => type === 'zone',
      mutate: (node) => {
        const data = JSON.stringify(node.data || {}, null, 2)
        return [
          {
            type: 'html',
            value: `<section><h6>${node.identifier}</h6>`,
          },
          data !== '{}' && {
            type: 'code',
            lang: null,
            value: data,
          },
          ...node.children,
          {
            type: 'html',
            value: '<hr /></section>',
          },
        ].filter(Boolean)
      },
    }),
  )
  .use(tag.expand('sub'))
  .use(tag.expand('sup'))
  .use(span.expand)

export const stringify = (mdast) =>
  stringifier.stringify(stringifier.runSync(mdast))
