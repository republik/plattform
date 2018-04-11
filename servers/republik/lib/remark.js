const unified = require('unified')
const remarkParse = require('remark-parse')
const remarkBreaks = require('remark-breaks')
const remarkStripHTML = require('remark-strip-html')
const select = require('unist-util-select')

// https://github.com/remarkjs/remark/tree/master/packages/remark-parse#turning-off-a-tokenizer
delete remarkParse.Parser.prototype.blockTokenizers.table

// TODO: move into it's own package - with tests
const isJSLink = /^javascript:/
function remarkRemoveJSLinks (_, options = {}) {
  return (ast) => {
    select(ast, 'link').forEach((node) => {
      if (isJSLink.test(node.url)) {
        node.type = 'text'
        node.value = node.children[0].value
        delete node.url
        delete node.title
        delete node.children
      }
    })
  }
}

const parser = unified()
  .use(remarkParse, {
    position: false,
    commonmark: true,
    gfm: true,
    footnotes: false
  })
  .use(remarkBreaks)
  .use(remarkStripHTML)
  .use(remarkRemoveJSLinks)

module.exports.parse = md => parser.runSync(parser.parse(md))
