import { getEventTransfer } from '@republik/slate-react'
import { fromHtml } from 'hast-util-from-html'
import { toMdast } from 'hast-util-to-mdast'

const hasParent = (type, document, key) => {
  const parent = document.getParent(key)
  if (!parent) return
  return parent.type === type ? true : hasParent(type, document, parent.key)
}

// Google adds a weird b tag around the paragraphs.
// We remove it, because the parser doesnt like it.
const normalise = (html) =>
  html.replace(/<b[^>]*font-weight\s*:\s*normal[^>]*>/g, '')

const PARAGRAPH_TYPES = ['PARAGRAPH', 'INFOP', 'BLOCKQUOTEPARAGRAPH']

/*const {
  FRAGMENT,
  HTML,
  NODE,
  RICH,
  TEXT
} = TRANSFER_TYPES*/

const createPasteHtml =
  (centerModule, figureModule) => (event, change, editor) => {
    const transfer = getEventTransfer(event)
    const cursor = editor.value.selection.anchorKey
    const blockType = editor.value.document.getClosestBlock(cursor).type

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
      const isByline = blockType === 'CENTERBYLINE' || blockType === 'BYLINE'
      if (isByline) return

      const isCenter = hasParent(
        centerModule.TYPE,
        editor.value.document,
        cursor,
      )
      const isCaption = blockType === 'CAPTION_TEXT'

      const html =
        isCenter || isCaption ? normalise(transfer.html) : transfer.text
      const hast = fromHtml(html)
      const mdast = toMdast(hast)

      const currentSerializer = isCaption
        ? figureModule.helpers.captionSerializer
        : centerModule.helpers.childSerializer
      const pastedAst = currentSerializer.deserialize(mdast)

      change.insertFragment(pastedAst.document)
      return true
    }
  }

export default createPasteHtml
