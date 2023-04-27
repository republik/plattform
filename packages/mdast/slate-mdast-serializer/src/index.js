import { Value } from 'slate'
import isEqual from 'lodash.isequal'

const rootRule = {
  match: object => object.object === 'document',
  matchMdast: node => node.type === 'root',
  fromMdast: (node, index, parent, {visitChildren}) => ({
    document: {
      data: node.meta,
      object: 'document',
      nodes: visitChildren(node)
    },
    object: 'value'
  }),
  toMdast: (object, index, parent, {visitChildren}) => ({
    type: 'root',
    meta: object.data,
    children: visitChildren(object)
  })
}

class MdastSerializer {
  constructor (options = {}) {
    const {rules = []} = options
    this.rules = []
      .concat(rules
        .filter(rule => rule !== rootRule)
      )
      .concat(rootRule)
  }
  toMdast (rawNode, rootIndex = 0, rootParent = null, {
    context = {},
    onNoRule = (node, index, parent, {context, visitChildren}) => {
      context.missing = true
      console.warn('Missing toMdast', node)
      return visitChildren(node)
    }
  } = {}) {
    const visitLeaves = (leaves, parent) => {
      if (!leaves.length) {
        return []
      }

      const firstMark = leaves[0].marks[0]
      if (firstMark) {
        let markEndIndex = 1
        while (leaves[markEndIndex] && leaves[markEndIndex].marks.find(mark => isEqual(mark, firstMark))) {
          markEndIndex += 1
        }

        return []
          .concat(
            visit(firstMark, 0, parent, () => {
              return visitLeaves(
                leaves.slice(0, markEndIndex).map(range => {
                  return Object.assign({}, range, {
                    marks: range.marks.filter(mark => !isEqual(mark, firstMark))
                  })
                }),
                parent
              )
            })
          )
          .concat(visitLeaves(leaves.slice(markEndIndex), parent))
      }

      let texts = leaves[0].text.split('\n').map(text => ({
        type: 'text',
        value: text
      }))
      if (texts.length > 1) {
        // intersperse break
        texts = texts
          .slice(1)
          .reduce((items, item, i) => {
            return items.concat([{
              type: 'break'
            }, item])
          }, [texts[0]])
      }

      return texts
        .concat(visitLeaves(leaves.slice(1), parent))
    }
    const visitArray = (nodes, parent) => {
      return nodes.reduce((children, child, i) => {
        if (child.object === 'text') {
          return children.concat(
            visitLeaves(child.leaves, child)
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
    const visit = (object, index, parent, visitChildren = defaultVisitChildren) => {
      const rule = this.rules.find(r => r.match && r.match(object))
      if (!rule || !rule.toMdast) {
        return onNoRule(object, index, parent, {
          context,
          visitChildren
        })
      }
      const mdastNode = rule.toMdast(
        object, index, parent,
        {
          visitChildren,
          context
        }
      )

      return mdastNode
    }

    return Array.isArray(rawNode)
      ? visitArray(rawNode, rootParent)
      : visit(rawNode, rootIndex, rootParent)
  }
  serialize (value, options = {}) {
    const raw = value.document.toJSON()
    return this.toMdast(raw, 0, null, options)
  }
  fromMdast (mdast, rootIndex = 0, rootParent = null, {
    context = {},
    onNoRule = (node, index, parent, {context}) => {
      context.missing = true
      console.warn('Missing fromMdast', node)
      return []
    }
  } = {}) {
    const compactText = (nodes) => {
      return nodes.reduce(
        (compact, node) => {
          const prev = compact[compact.length - 1]
          if (prev && prev.object === 'text' && node.object === 'text') {
            prev.leaves = prev.leaves.concat(node.leaves)
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
        if (node.object === 'mark') {
          return deserializeMark(node)
        } else if (node.object === 'text') {
          node.leaves = node.leaves.map((range) => {
            range.marks.unshift({
              object: 'mark',
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
          object: 'text',
          leaves: [
            {
              object: 'leaf',
              text: node.value,
              marks: []
            }
          ]
        }
      }

      let slateNode
      const rule = this.rules.find(r => r.matchMdast && r.matchMdast(node, index, parent))
      if (!rule || !rule.fromMdast) {
        slateNode = onNoRule(node, index, parent, {visitChildren, context})
      } else {
        slateNode = rule.fromMdast(
          node, index, parent,
          {
            visitChildren,
            context
          }
        )
      }

      if (slateNode.object === 'mark') {
        return deserializeMark(slateNode)
      }
      return slateNode
    }

    return Array.isArray(mdast)
      ? visitArray(mdast, rootParent)
      : visit(mdast, rootIndex, rootParent)
  }
  deserialize (data, options = {}) {
    return Value.fromJSON(this.fromMdast(
      data,
      0,
      null,
      options
    ))
  }
}

export default MdastSerializer
module.exports = MdastSerializer
