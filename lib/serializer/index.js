const unified = require('unified')
const remarkStringify = require('remark-stringify')
const remarkParse = require('remark-parse')
const isEqual = require('lodash/fp/isEqual')
const { Raw } = require('slate')

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

    this.processor = unified()
      .use(remarkParse, {
        commonmark: true
      })
      .use(remarkStringify, {
        bullet: '*',
        fence: '~',
        fences: true,
        incrementListMarker: false
      })
  }
  toMdast (raw) {
    const visitRanges = (ranges, parent) => {
      if (!ranges.length) {
        return []
      }

      const firstMark = ranges[0].marks[0]
      if (firstMark) {
        let markEndIndex = 1
        while (ranges[markEndIndex] && ranges[markEndIndex].marks.find(mark => isEqual(mark, firstMark))) {
          markEndIndex += 1
        }

        return [
          visit(firstMark, 0, parent, () => {
            return visitRanges(
              ranges.slice(0, markEndIndex).map(range => {
                return Object.assign({}, range, {
                  marks: range.marks.filter(mark => !isEqual(mark, firstMark))
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
    const stringify = (mdast) => this.processor.stringify(mdast)
    const visit = (object, index, parent, visitChildren) => {
      const rule = this.rules.find(r => r.match(object))
      if (!rule || !rule.toMdast) {
        console.error('Object', object)
        throw new Error(`No serializer defined for object of type "${object.kind}:${object.type}".`)
      }
      const mdastNode = rule.toMdast(
        object, index, parent,
        visitChildren || defaultVisitChildren,
        stringify
      )

      return mdastNode
    }

    return visit(raw, 0, null)
  }
  serialize (state) {
    return this.processor.stringify(
      this.toMdast(Raw.serialize(state).document)
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
    const parse = (md) => this.processor.parse(md)
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
        parse
      )
      if (slateNode.kind === 'mark') {
        return deserializeMark(slateNode)
      }
      return slateNode
    }

    return visit(mdast, 0, null)
  }
  deserialize (md) {
    return Raw.deserialize(this.fromMdast(
      this.processor.parse(md)
    ))
  }
}

module.exports = MarkdownSerializer
