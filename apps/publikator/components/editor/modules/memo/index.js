import {
  Editorial,
  Marker,
  MemoForm,
  Overlay,
  OverlayBody,
  OverlayToolbar,
} from '@project-r/styleguide'
import { IconMemo } from '@republik/icons'
import MarkdownSerializer from '@republik/slate-mdast-serializer'
import compose from 'lodash/flowRight'

import { withRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getRepoIdFromQuery } from '../../../../lib/repoIdHelper'

import withT from '../../../../lib/withT'
import { buttonStyles, createInlineButton, matchInline } from '../../utils'

const Memo = compose(
  withT,
  withRouter,
)(({ t, editor, node, children, isSelected, router }) => {
  const [showModal, setShowModal] = useState()
  const [parentId, setParentId] = useState(node.data.get('parentId'))
  const [marker, setMarker] = useState(node.data.get('marker'))

  // noOpen flag added when deserializing
  // only new memos trigger the modal automatically
  useEffect(() => {
    !node.data.get('noOpen') && open()
  }, [])

  const open = (e) => {
    e?.preventDefault()
    setShowModal(true)
  }

  const close = (e) => {
    e?.preventDefault()
    editor.change((change) => {
      change.setNodeByKey(node.key, {
        data: node.data.merge({
          parentId,
          marker,
        }),
      })

      setShowModal(false)
    })
  }

  const { commitId } = router.query
  const repoId = getRepoIdFromQuery(router.query)

  return (
    <>
      {showModal && (
        <Overlay mUpStyle={{ maxWidth: 720, minHeight: 0 }} onClose={close}>
          <OverlayToolbar title='Memo' onClose={close} />
          <OverlayBody>
            <MemoForm
              t={t}
              repoId={repoId}
              commitId={commitId}
              parentId={parentId}
              setParentId={setParentId}
              marker={marker}
              setMarker={setMarker}
              deleteMemo={() =>
                editor.change((change) => {
                  change.unwrapInline(node.type)
                })
              }
              MarkedSection={
                <Editorial.P attributes={{ style: { marginBottom: 20 } }}>
                  <Marker marker={marker}>{children}</Marker>
                </Editorial.P>
              }
            />
          </OverlayBody>
        </Overlay>
      )}
      <Marker marker={marker} isSelected={isSelected} onDoubleClick={open}>
        {children}
      </Marker>
    </>
  )
})

const MemoModule = ({ rule, TYPE, context }) => {
  const memo = {
    match: matchInline(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, { visitChildren }) => ({
      kind: 'inline',
      type: TYPE,
      data: {
        ...node.data,
        noOpen: true,
      },
      nodes: visitChildren(node),
    }),
    toMdast: (object, index, parent, { visitChildren }) => ({
      type: 'span',
      data: {
        type: TYPE,
        parentId: object.data?.parentId,
        marker: object.data?.marker,
      },
      children: visitChildren(object),
    }),
  }

  const serializer = new MarkdownSerializer({
    rules: [memo],
  })

  return {
    TYPE,
    helpers: {
      serializer,
    },
    ui: {
      textFormatButtons: [
        createInlineButton({
          type: TYPE,
        })(({ active, disabled, visible, ...props }) => {
          if (context.isTemplate) {
            return null
          }

          return (
            <span
              {...buttonStyles.mark}
              {...props}
              data-active={active}
              data-disabled={disabled}
              data-visible={visible}
            >
              <IconMemo size={24} />
            </span>
          )
        }),
      ],
    },
    plugins: [
      {
        renderNode({ attributes, ...props }) {
          const { node } = props
          if (!memo.match(node)) return
          return (
            <span {...attributes}>
              <Memo {...props} />
            </span>
          )
        },
      },
    ],
  }
}

export default MemoModule
