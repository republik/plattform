const unified = require('unified')
const remarkParse = require('remark-parse')
const remarkBreaks = require('remark-breaks')

// https://github.com/remarkjs/remark/tree/master/packages/remark-parse#turning-off-a-tokenizer
delete remarkParse.Parser.prototype.blockTokenizers.table

const parser = unified()
  .use(remarkParse, {
    position: false,
    commonmark: true,
    gfm: true,
    footnotes: false
  })
  .use(remarkBreaks)

module.exports.parse = md => parser.runSync(parser.parse(md))
