const unified = require('unified')
const remarkStringify = require('remark-stringify')
const remarkParse = require('remark-parse')
const frontmatter = require('remark-frontmatter')
const { equals } = require('ramda')
const { Raw } = require('slate')

const zone = require('./zone')
const meta = require('./meta')

const rootRule = {
  match: object => object.kind === 'document',
  matchMdast: node => node.type === 'root',
  fromMdast: (node, index, parent, visitChildren) => ({
    document: {
      data: node.meta,
      kind: 'document',
      nodes: visitChildren(node)
    },
    kind: 'state'
  }),
  toMdast: (object, index, parent, visitChildren) => ({
    type: 'root',
    meta: object.data,
    children: visitChildren(object)
  })
}

class MarkdownSerializer {
  constructor (options = {}) {
    this.rules = []
      .concat(options.rules || [])
      .concat(rootRule)

    const parser = unified()
      .use(remarkParse, {
        commonmark: true
      })
      .use(frontmatter, ['yaml'])
      .use(meta.parse)
      .use(zone.collapse, {
        test: ({type, value}) => {
          if (type !== 'html') {
            return
          }
          if (value.match(/^\s*<section>\s*<h6>([^<]+)<\/h6>/)) {
            return 'start'
          }
          if (value.match(/^\s*<hr\s*\/>\s*<\/section>\s*/)) {
            return 'end'
          }
        },
        mutate: (start, nodes, end) => {
          let data = {}
          const identifier = start.value.match(/<h6>([^<]+)<\/h6>/)[1].trim()
          const dataNode = nodes[0]
          const hasDataNode = dataNode && dataNode.type === 'code'
          if (hasDataNode) {
            data = JSON.parse(dataNode.value)
          }
          return {
            type: 'zone',
            identifier,
            data,
            children: hasDataNode
              ? nodes.slice(1)
              : nodes
          }
        }
      })
    this.parse = md => parser.runSync(parser.parse(md))

    const stringifier = unified()
      .use(remarkStringify, {
        bullet: '*',
        fences: true
      })
      .use(frontmatter, ['yaml'])
      .use(meta.format)
      .use(zone.expand, {
        test: ({type}) => type === 'zone',
        mutate: (node) => {
          const data = JSON.stringify(node.data || {}, null, 2)
          return [
            {
              type: 'html',
              value: `<section><h6>${node.identifier}</h6>`
            },
            data !== '{}' && {
              type: 'code',
              lang: null,
              value: data
            },
            ...node.children,
            {
              type: 'html',
              value: '<hr /></section>'
            }
          ].filter(Boolean)
        }
      })
    this.stringify = mdast => stringifier.stringify(stringifier.runSync(mdast))
  }
  toMdast (rawNode, context = {}, onNoRule = (node, context, visitChildren) => {
    context.missing = true
    console.warn('Missing toMdast', node)
    return visitChildren(node)
  }) {
    const visitRanges = (ranges, parent) => {
      if (!ranges.length) {
        return []
      }

      const firstMark = ranges[0].marks[0]
      if (firstMark) {
        let markEndIndex = 1
        while (ranges[markEndIndex] && ranges[markEndIndex].marks.find(mark => equals(mark, firstMark))) {
          markEndIndex += 1
        }

        return []
          .concat(
            visit(firstMark, 0, parent, () => {
              return visitRanges(
                ranges.slice(0, markEndIndex).map(range => {
                  return Object.assign({}, range, {
                    marks: range.marks.filter(mark => !equals(mark, firstMark))
                  })
                }),
                parent
              )
            })
          )
          .concat(visitRanges(ranges.slice(markEndIndex), parent))
      }

      const text = {
        type: 'text',
        value: ranges[0].text
      }
      return [
        text
      ].concat(visitRanges(ranges.slice(1), parent))
    }
    const visitArray = (nodes, parent) => {
      return nodes.reduce((children, child, i) => {
        if (child.kind === 'text') {
          return children.concat(
            visitRanges(child.ranges, child)
          )
        }

        return children.concat(visit(child, i, parent))
      }, [])
    }
    const defaultVisitChildren = object => {
      if (!object.nodes || object.nodes.length === 0) {
        return []
      }
      return visitArray(object.nodes, object)
    }
    const visit = (object, index, parent, visitChildren) => {
      const rule = this.rules.find(r => r.match(object))
      if (!rule || !rule.toMdast) {
        return onNoRule(object, context, visitChildren || defaultVisitChildren)
      }
      const mdastNode = rule.toMdast(
        object, index, parent,
        visitChildren || defaultVisitChildren,
        context
      )

      return mdastNode
    }

    return Array.isArray(rawNode)
      ? visitArray(rawNode, null)
      : visit(rawNode, 0, null)
  }
  serialize (state, options = {}) {
    const raw = Raw.serialize(state).document
    const mdast = this.toMdast(raw, options.context)
    return options.mdast
      ? mdast
      : this.stringify(mdast)
  }
  fromMdast (mdast, context = {}, onNoRule = (node, context) => {
    context.missing = true
    console.warn('Missing fromMdast', node)
    return []
  }) {
    const compactText = (nodes) => {
      return nodes.reduce(
        (compact, node) => {
          const prev = compact[compact.length - 1]
          if (prev && prev.kind === 'text' && node.kind === 'text') {
            prev.ranges = prev.ranges.concat(node.ranges)
            return compact
          }
          compact.push(node)
          return compact
        },
        []
      )
    }
    const visitArray = (children, parent) => {
      return compactText(children.reduce((all, child, i) => {
        return all.concat(visit(child, i, parent))
      }, []))
    }
    const visitChildren = node => {
      if (!node.children || node.children.length === 0) {
        return []
      }
      return visitArray(node.children, node)
    }
    const deserializeMark = (mark) => {
      const { type, data } = mark

      const applyMark = (node) => {
        if (node.kind === 'mark') {
          return deserializeMark(node)
        } else if (node.kind === 'text') {
          node.ranges = node.ranges.map((range) => {
            range.marks.unshift({
              kind: 'mark',
              type,
              data
            })
            return range
          })
        } else {
          node.nodes = node.nodes.map(applyMark)
        }

        return node
      }

      return mark.nodes.reduce((nodes, node) => {
        const ret = applyMark(node)
        return nodes.concat(ret)
      }, [])
    }
    const visit = (node, index, parent) => {
      if (node.type === 'text') {
        return {
          kind: 'text',
          ranges: [
            {
              kind: 'range',
              text: node.value,
              marks: []
            }
          ]
        }
      }

      let slateNode
      const rule = this.rules.find(r => r.matchMdast && r.matchMdast(node))
      if (!rule || !rule.fromMdast) {
        slateNode = onNoRule(node, context)
      } else {
        slateNode = rule.fromMdast(
          node, index, parent,
          visitChildren,
          context
        )
      }

      if (slateNode.kind === 'mark') {
        return deserializeMark(slateNode)
      }
      return slateNode
    }

    return Array.isArray(mdast)
      ? visitArray(mdast, null)
      : visit(mdast, 0, null)
  }
  deserialize (data, options = {}) {
    return Raw.deserialize(this.fromMdast(
      options.mdast
        ? data
        : this.parse(data),
      options.context
    ))
  }
}

module.exports = MarkdownSerializer
