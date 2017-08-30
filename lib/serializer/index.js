const unified = require('unified')
const remarkStringify = require('remark-stringify')
const remarkParse = require('remark-parse')
const { equals } = require('ramda')
const { Raw } = require('slate')

const zone = require('./zone')

const rootRule = {
  match: object => object.kind === 'document',
  matchMdast: node => node.type === 'root',
  fromMdast: (node, index, parent, visitChildren) => ({
    document: {
      data: {},
      kind: 'document',
      nodes: visitChildren(node)
    },
    kind: 'state'
  }),
  toMdast: (object, index, parent, visitChildren) => ({
    type: 'root',
    children: visitChildren(object)
  })
}

class MarkdownSerializer {
  constructor (options = {}) {
    this.rules = []
      .concat(options.rules)
      .concat(rootRule)

    const parser = unified()
      .use(remarkParse, {
        commonmark: true
      })
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
      .use(zone.expand, {
        test: ({type}) => type === 'zone',
        mutate: (node) => [
          {
            type: 'html',
            value: `<section><h6>${node.identifier}</h6>`
          },
          node.data && Object.keys(node.data).length && {
            type: 'code',
            lang: null,
            value: JSON.stringify(node.data, null, 2)
          },
          ...node.children,
          {
            type: 'html',
            value: '<hr /></section>'
          }
        ].filter(Boolean)
      })
    this.stringify = mdast => stringifier.stringify(stringifier.runSync(mdast))
  }
  toMdast (state) {
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

        return [
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
        ].concat(visitRanges(ranges.slice(markEndIndex), parent))
      }

      const text = {
        type: 'text',
        value: ranges[0].text
      }
      return [
        text
      ].concat(visitRanges(ranges.slice(1), parent))
    }
    const defaultVisitChildren = object => {
      if (!object.nodes || object.nodes.length === 0) {
        return undefined
      }
      return object.nodes.reduce((children, child, i) => {
        if (child.kind === 'text') {
          return children.concat(
            visitRanges(child.ranges, child)
          )
        }

        return children.concat(visit(child, i, object))
      }, [])
    }
    const visit = (object, index, parent, visitChildren) => {
      const rule = this.rules.find(r => r.match(object))
      if (!rule || !rule.toMdast) {
        console.error('Object', object)
        throw new Error(`No serializer defined for object of type "${object.kind}:${object.type}".`)
      }
      const mdastNode = rule.toMdast(
        object, index, parent,
        visitChildren || defaultVisitChildren,
        this.stringify
      )

      return mdastNode
    }

    const raw = Raw.serialize(state).document
    return visit(raw, 0, null)
  }
  serialize (state) {
    return this.stringify(
      this.toMdast(state)
    )
  }
  fromMdast (mdast) {
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
    const defaultVisitChildren = node => {
      if (!node.children || node.children.length === 0) {
        return []
      }
      return compactText(node.children.reduce((children, child, i) => {
        return children.concat(visit(child, i, node))
      }, []))
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
    const visit = (node, index, parent, visitChildren) => {
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

      const rule = this.rules.find(r => r.matchMdast && r.matchMdast(node))
      if (!rule || !rule.fromMdast) {
        console.error('Node', node)
        throw new Error(`No deserializer defined for node of type "${node.kind}:${node.type}".`)
      }

      const slateNode = rule.fromMdast(
        node, index, parent,
        visitChildren || defaultVisitChildren,
        this.parse
      )
      if (slateNode.kind === 'mark') {
        return deserializeMark(slateNode)
      }
      return slateNode
    }

    const raw = visit(mdast, 0, null)
    return Raw.deserialize(raw)
  }
  deserialize (data, options = {}) {
    return this.fromMdast(
      options.mdast
        ? data
        : this.parse(data)
    )
  }
}

module.exports = MarkdownSerializer
