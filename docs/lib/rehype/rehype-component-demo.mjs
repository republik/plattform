import path from 'node:path'
import fs from 'node:fs'
import { visit } from 'unist-util-visit'
import { mdxElement, mdxImport } from './unist-mdx-element.mjs'

const getIdentifier = (filePath) => {
  return filePath.replace(/[^a-z0-9]/gi, '_')
}

export const rehypeComponentDemo = () => (tree) => {
  const importedIdentifiers = new Set()

  visit(tree, (node) => {
    if (node.name === 'ComponentDemo') {
      const file = getAttribute(node, 'file')

      if (typeof file === 'string') {
        node.children = []

        const filePath = `${process.cwd()}/${file}`

        if (fileExists(filePath)) {
          const extension = file.split('.').pop()
          const syntax = getSyntax(extension)
          const source = fs.readFileSync(path.join(filePath), 'utf8')
          const identifier = `ComponentDemo_${getIdentifier(file)}`

          if (!importedIdentifiers.has(identifier)) {
            importedIdentifiers.add(identifier)
            node.children.push(mdxImport({ identifier, source: filePath }))
          }

          node.attributes.push({
            type: 'mdxJsxAttribute',
            name: 'Component',
            value: {
              type: 'mdxJsxAttributeValueExpression',
              value: identifier,
              data: {
                estree: {
                  type: 'Program',
                  body: [
                    {
                      type: 'ExpressionStatement',
                      expression: {
                        type: 'Identifier',
                        name: identifier,
                      },
                    },
                  ],
                },
              },
            },
          })

          node.children.push(
            mdxElement({
              name: 'pre',
              props: {
                file: filePath,
                syntax,
                source,
              },
              children: [
                mdxElement({
                  name: 'code',
                  props: {
                    // Recreate the language class for syntax highlighting
                    className: [`language-${syntax}`],
                  },
                  children: [
                    {
                      type: 'text',
                      value: source,
                    },
                  ],
                }),
              ],
            }),
          )
        }
      }
    }
  })
}

function getAttribute(node, name) {
  return node.attributes?.find((attribute) => attribute.name === name)?.value
}

function fileExists(path) {
  try {
    fs.accessSync(path)
    return true
  } catch (e) {
    return false
  }
}

function getSyntax(extension) {
  return extension
}
