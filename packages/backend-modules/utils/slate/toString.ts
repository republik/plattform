import type { SlateNode } from './NodeMapping'

/**
 * Stringify array of Slate nodes ("Slate tree").
 *
 */
function toString(node: SlateNode, glue = ' '): string {
  const texts = node.children?.map((child: SlateNode) => {
    // e.g. children in paragraphs
    if (typeof child.text === 'string') {
      return child.text
    }

    // e.g. blockCode node
    if (child.value) {
      return child.value
    }

    if (child.children) {
      // type = paragraph + space?
      const appendGlue = child.type !== 'link'

      return toString(child, glue) + (appendGlue ? glue : '')
    }

    console.error('unhandeled child', child.type, child)
  })

  return texts.join('').trim()
}

module.exports = toString
