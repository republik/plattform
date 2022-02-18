import React from 'react'
import { css } from 'glamor'

const INVALID_CONTROL_TYPE = 'SPECIALCHARS_INVALID_CONTROL'
const INVALID_TYPE = 'SPECIALCHARS_INVALID'
const HYPHEN_TYPE = 'SPECIALCHARS_HYPHEN'
const NBSP_TYPE = 'SPECIALCHARS_NBSP'

const CHARS = [
  ['\u2028', INVALID_CONTROL_TYPE], // LINE SEPARATOR
  ['\u0308', INVALID_CONTROL_TYPE], // COMBINING DIAERESIS
  ['\u2022', INVALID_TYPE], // BULLET
  ['\u2027', INVALID_TYPE], // HYPHENATION POINT
  ['\u2423', INVALID_TYPE], // OPEN BOX
  ['\u00ad', HYPHEN_TYPE], // SOFT HYPHEN
  ['\u00a0', NBSP_TYPE], // NO-BREAK SPACE
]

const styles = {
  [INVALID_CONTROL_TYPE]: css({
    ':before': {
      color: 'red',
      content: '•', // BULLET \u2022
    },
  }),
  [INVALID_TYPE]: css({
    color: 'red',
  }),
  [HYPHEN_TYPE]: css({
    ':before': {
      color: '#1E90FF',
      content: '‧', // HYPHENATION POINT \u2027
    },
  }),
  [NBSP_TYPE]: css({
    ':before': {
      color: '#1E90FF',
      marginRight: '-0.25em',
      content: '␣', // OPEN BOX \u2423
    },
  }),
}

const createDecoration = (key, index, type) => ({
  anchorKey: key,
  anchorOffset: index,
  focusKey: key,
  focusOffset: index + 1,
  marks: [{ type }],
  // ToDo: After slate 0.39.0+ upgrade, use code below:
  // anchor: {
  //   key: key,
  //   offset: index
  // },
  // focus: {
  //   key: key,
  //   offset: index + 1
  // },
  // mark: { type }
})

export default () => {
  return {
    renderMark({ mark, children, attributes }) {
      if (styles[mark.type]) {
        return (
          <span {...attributes} {...styles[mark.type]}>
            {children}
          </span>
        )
      }
    },
    decorateNode(node) {
      const texts = node.nodes.filter((child) => child.kind === 'text')
      if (!texts.size) return

      const decorations = texts.reduce((decs, textNode) => {
        const text = textNode.text
        CHARS.forEach(([char, type]) => {
          let index = text.indexOf(char)
          while (index !== -1) {
            decs.push(createDecoration(textNode.key, index, type))
            index = text.indexOf(char, index + 1)
          }
        })

        return decs
      }, [])

      return decorations
    },
  }
}
