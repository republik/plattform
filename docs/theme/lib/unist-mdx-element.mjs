import { u } from 'unist-builder'

/**
 * A tiny wrapper around unist-builder to easily create
 * a node that is an HTML element or a React component.
 */
export const mdxElement = ({ name, props = {}, children = [] }) => {
  const isHtmlElement = name.toLowerCase() === name
  if (isHtmlElement) {
    return u('element', { tagName: name, properties: props }, children)
  }

  return u('mdxJsxFlowElement', {
    name,
    children,
    attributes: [
      ...Object.entries(props).map(([name, value]) => ({
        name,
        type: 'mdxJsxAttribute',
        value: typeof value === 'boolean' ? bool(value) : value,
      })),
    ],
    data: { _mdxExplicitJsx: true },
  })
}

export const mdxImport = ({ identifier, source }) => {
  return u('mdxjsEsm', {
    value: `import ${identifier} from "${source}"`,

    data: {
      estree: {
        type: 'Program',
        body: [
          {
            type: 'ImportDeclaration',
            specifiers: [
              {
                type: 'ImportDefaultSpecifier',
                local: { type: 'Identifier', name: identifier },
              },
            ],
            source: {
              type: 'Literal',
              value: source,
            },
          },
        ],
        sourceType: 'module',
      },
    },
  })
}

const bool = (value) => ({
  type: 'mdxJsxAttributeValueExpression',
  data: {
    estree: {
      sourceType: 'module',
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'Literal',
            value,
          },
        },
      ],
    },
  },
})
