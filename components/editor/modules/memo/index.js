import React, { useState, useEffect } from 'react'
import { compose } from 'react-apollo'
import { css } from 'glamor'
import MarkdownSerializer from 'slate-mdast-serializer'
import MemoIcon from 'react-icons/lib/md/comment'
import RemoveIcon from 'react-icons/lib/md/delete'
import { Editorial, Interaction } from '@project-r/styleguide'

import {
  Overlay,
  OverlayToolbar,
  OverlayBody,
  IconButton
} from '@project-r/styleguide'

import withT from '../../../../lib/withT'
import { matchInline, createInlineButton, buttonStyles } from '../../utils'

import standard, * as markers from './Markers'
import MemoTree from './MemoTree'
import { withRouter } from 'next/router'

const styles = {
  tooling: css({
    display: 'flex',
    alignItems: 'center',
    paddingBottom: 40
  })
}

const getMarker = name => {
  return markers[name] || standard
}

const Memo = compose(
  withT,
  withRouter
)(({ editor, node, children, isSelected, repoId, router }) => {
  const [showModal, setShowModal] = useState()
  const [parentId, setParentId] = useState()
  const [marker, setMarker] = useState()

  // If Memo is untouched – flag is missing – open overlay.
  useEffect(() => {
    !node.data.get('touched') && open()
  }, [node.data.get('touched')])

  useEffect(() => {
    reset()
  }, [])

  const pickMarker = name => e => {
    e?.preventDefault?.()
    setMarker(name)
    editor.change(change => {
      change.setNodeByKey(node.key, {
        data: node.data.merge({
          marker: name,
          touched: true
        })
      })
    })
  }

  const reset = e => {
    e?.preventDefault?.()
    setParentId(node.data.get('parentId'))
    setMarker(node.data.get('marker'))
  }

  const open = e => {
    e?.preventDefault?.()
    setShowModal(true)
  }

  const close = e => {
    e?.preventDefault?.()
    setShowModal(false)
  }

  const remove = e => {
    e?.preventDefault?.()
    editor.change(change => {
      change.unwrapInline(node.type)
    })
  }

  const onPublished = memo => {
    if (!memo.parentIds.length) {
      setParentId(memo.id)

      editor.change(change => {
        change.setNodeByKey(node.key, {
          data: node.data.merge({
            parentId: memo.id,
            touched: true
          })
        })
      })
    }
  }

  const { Marker } = getMarker(marker)
  const discussionEnabled = router.query.commitId !== 'new'

  return (
    <>
      {showModal && (
        <Overlay mUpStyle={{ maxWidth: 720, minHeight: 0 }} onClose={close}>
          <OverlayToolbar title='Memo' onClose={close} />
          <OverlayBody>
            <Editorial.P attributes={{ style: { marginBottom: 20 } }}>
              <Marker>{children}</Marker>
            </Editorial.P>
            <div {...styles.tooling}>
              {Object.keys(markers)
                .filter(name => name !== 'default')
                .map(name => {
                  const { Picker } = getMarker(name)
                  return (
                    <Picker
                      key={`marker-${name}`}
                      isSelected={marker === name}
                      onClick={pickMarker(name)}
                    />
                  )
                })}
              <div style={{ flexGrow: 1 }} />
              <IconButton
                label='Memo entfernen'
                Icon={RemoveIcon}
                onClick={remove}
              />
            </div>
            {discussionEnabled ? (
              <MemoTree
                repoId={repoId}
                parentId={parentId}
                onPublished={onPublished}
              />
            ) : (
              <Interaction.P>
                Sie können erst Kommentare hinterlassen, nachdem Sie den Beitrag
                kommittet haben.
              </Interaction.P>
            )}
          </OverlayBody>
        </Overlay>
      )}
      <Marker isSelected={isSelected} onDoubleClick={open}>
        {children}
      </Marker>
    </>
  )
})

const MemoModule = ({ rule, TYPE }) => {
  const memo = {
    match: matchInline(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, { visitChildren }) => ({
      kind: 'inline',
      type: TYPE,
      data: {
        ...node.data,
        touched: true
      },
      nodes: visitChildren(node)
    }),
    toMdast: (object, index, parent, { visitChildren }) => ({
      type: 'span',
      data: {
        type: TYPE,
        parentId: object.data?.parentId,
        marker: object.data?.marker
      },
      children: visitChildren(object)
    })
  }

  const serializer = new MarkdownSerializer({
    rules: [memo]
  })

  return {
    TYPE,
    helpers: {
      serializer
    },
    ui: {
      textFormatButtons: [
        createInlineButton({
          type: TYPE
        })(({ active, disabled, visible, ...props }) => (
          <span
            {...buttonStyles.mark}
            {...props}
            data-active={active}
            data-disabled={disabled}
            data-visible={visible}
          >
            <MemoIcon />
          </span>
        ))
      ]
    },
    plugins: [
      {
        renderNode(props) {
          const { children, ...rest } = props
          const { node, editor } = rest

          if (!memo.match(node)) return

          const repoId = editor.value.document
            .findDescendant(node => node.type === 'TITLE')
            .data.get('repoId')

          // @TODO: Wenn Dokument nicht gespeichert
          // @TODO: Wenn Dokument ein Template ist …

          return (
            <Memo {...rest} repoId={repoId}>
              {children}
            </Memo>
          )
        }
      }
    ]
  }
}

export default MemoModule
