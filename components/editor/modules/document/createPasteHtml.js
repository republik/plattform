import React from 'react'
import { parse } from '@orbiting/remark-preset'

import * as htmlParse from 'rehype-parse'
import rehype2remark from 'rehype-remark'
import stringify from 'remark-stringify'

import { getEventTransfer } from 'slate-react'
import unified from 'unified'

const hasParent = (type, document, key) => {
  const parent = document.getParent(key)
  if (!parent) return
  return parent.type === type ? true : hasParent(type, document, parent.key)
}

export default (centerModule, figureModule) => (event, change, editor) => {
  const transfer = getEventTransfer(event)
  if (transfer.type !== 'html') return

  const cursor = editor.value.selection.anchorKey
  const blockType = editor.value.document.getClosestBlock(cursor).type

  const isByline = blockType === 'CENTERBYLINE' || blockType === 'BYLINE'
  if (isByline) return

  const isCenter = hasParent(centerModule.TYPE, editor.value.document, cursor)
  const isCaption = blockType === 'CAPTION_TEXT'

  const toMd = unified()
    .use(htmlParse, {
      emitParseErrors: true,
      duplicateAttribute: false
    })
    .use(rehype2remark)
    .use(stringify)
  const pastedMd = toMd.processSync(
    isCenter || isCaption ? transfer.html : transfer.text
  )
  const currentSerializer = isCaption
    ? figureModule.helpers.captionSerializer
    : centerModule.helpers.childSerializer
  const pastedAst = currentSerializer.deserialize(parse(pastedMd.contents))

  change.insertFragment(pastedAst.document)
  return true
}
