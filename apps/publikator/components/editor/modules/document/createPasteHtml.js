import { getEventTransfer } from '@republik/slate-react'
import Html from 'slate-html-serializer'

const hasParent = (type, document, key) => {
  const parent = document.getParent(key)
  if (!parent) return
  return parent.type === type ? true : hasParent(type, document, parent.key)
}

const getDescendantNodes = (node, all = []) => {
  node.childNodes.forEach((child) => {
    all.push(child)
    getDescendantNodes(child, all)
  })
  return all
}

const PARAGRAPH_TYPES = ['PARAGRAPH', 'INFOP', 'BLOCKQUOTEPARAGRAPH']

// Tags to blocks.
const BLOCK_TAGS = {
  p: 'PARAGRAPH',
  // li: 'LISTITEM',
  // ul: 'LIST',
  // ol: 'LIST',
  blockquote: 'PARAGRAPH',
  h1: 'H2',
  h2: 'H2',
  h3: 'H2',
  h4: 'H2',
  h5: 'H2',
  h6: 'H2',
}

// Tags to marks.
const MARK_TAGS = {
  strong: 'STRONG',
  b: 'STRONG',
  em: 'EMPHASIS',
  i: 'EMPHASIS',
}

// Serializer rules.
const RULES = [
  {
    deserialize(el, next) {
      const block = BLOCK_TAGS[el.tagName.toLowerCase()]
      if (!block) return
      return {
        kind: 'block',
        type: block,
        nodes: next(el.childNodes),
      }
    },
  },
  {
    deserialize(el, next) {
      const mark = MARK_TAGS[el.tagName.toLowerCase()]
      if (!mark) return
      return {
        kind: 'mark',
        type: mark,
        nodes: next(el.childNodes),
      }
    },
  },
  // Special case for lists
  {
    deserialize(el, next) {
      if (!['ul', 'ol'].includes(el.tagName.toLowerCase())) return
      // nested lists are not supported, so we convert them to paragraphs
      if (el.parentNode?.tagName?.toLowerCase() === 'li')
        return {
          kind: 'block',
          type: 'PARAGRAPH',
          nodes: next(el.childNodes),
        }
      return {
        kind: 'block',
        type: 'LIST',
        data: {
          ordered: false,
          compact: true,
        },
        nodes: next(
          getDescendantNodes(el).filter(
            (n) => n.tagName?.toLowerCase() === 'li',
          ),
        ),
      }
    },
  },
  {
    // Special case for images, to grab their src.
    deserialize(el) {
      if (el.tagName.toLowerCase() != 'img') return
      return {
        kind: 'block',
        type: 'FIGURE',
        isVoid: false,
        data: {
          excludeFromGallery: false,
        },
        nodes: [
          {
            kind: 'block',
            type: 'FIGURE_IMAGE',
            isVoid: true,
            data: {
              alt: 'Alt',
              src: el.getAttribute('src'),
              srcDark: el.getAttribute('src'),
            },
          },
          {
            kind: 'block',
            type: 'FIGURE_CAPTION',
            isVoid: false,
            nodes: [
              {
                kind: 'block',
                type: 'CAPTION_TEXT',
                isVoid: false,
                nodes: [
                  {
                    kind: 'text',
                    leaves: [
                      {
                        kind: 'leaf',
                        text: 'Caption',
                      },
                    ],
                  },
                ],
              },
              {
                kind: 'block',
                type: 'EMPHASIS',
                isVoid: false,
                nodes: [
                  {
                    kind: 'text',
                    leaves: [
                      {
                        kind: 'leaf',
                        text: 'Byline',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }
    },
  },
  {
    // Special case for links, to grab their href.
    deserialize(el, next) {
      if (el.tagName.toLowerCase() != 'a') return
      return {
        kind: 'inline',
        type: 'LINK',
        isVoid: false,
        data: {
          title: '',
          href: el.getAttribute('href'),
        },
        nodes: next(el.childNodes),
      }
    },
  },
]

const serializer = new Html({ rules: RULES })

const createPasteHtml = (centerModule) => (event, change, editor) => {
  const transfer = getEventTransfer(event)
  const cursor = editor.value.selection.anchorKey
  const blockType = editor.value.document.getClosestBlock(cursor).type

  console.log('PASTE EVENT', transfer, blockType)

  if (!transfer?.text) return

  if (transfer.type === 'text' || transfer.type === 'rich') {
    if (PARAGRAPH_TYPES.includes(blockType)) {
      change.insertText(transfer.text.replace(/\n{2,}/g, '\n\n'))
      return true
    }
    change.insertText(transfer.text.replace(/\n+/g, '\n'))
    return true
  }

  if (transfer.type === 'html') {
    console.log('-> CONVERTING HTML')
    const isCenter = hasParent(centerModule.TYPE, editor.value.document, cursor)

    // we only paste html when we are in a paragraph in a center block (aka fliesstext)
    if (!PARAGRAPH_TYPES.includes(blockType) || !isCenter) {
      change.insertText(transfer.text.replace(/\n+/g, '\n'))
      return true
    }

    try {
      const { document } = serializer.deserialize(transfer.html)
      // console.log(JSON.stringify(document, null, 2))
      change.insertFragment(document)
      return true
    } catch (e) {
      console.log('error pasting html', e)
      change.insertText(transfer.text.replace(/\n+/g, '\n'))
      return true
    }
  }
}

export default createPasteHtml
