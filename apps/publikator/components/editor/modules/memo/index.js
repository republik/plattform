import { useState, useEffect } from 'react'
import compose from 'lodash/flowRight'
import { css } from 'glamor'
import MarkdownSerializer from 'slate-mdast-serializer'
import {
  MdRateReview as MemoIcon,
  MdDelete as RemoveIcon,
} from 'react-icons/md'
import { Editorial, Interaction } from '@project-r/styleguide'
import {
  Overlay,
  OverlayToolbar,
  OverlayBody,
  IconButton,
} from '@project-r/styleguide'

import withT from '../../../../lib/withT'
import { matchInline, createInlineButton, buttonStyles } from '../../utils'
import { getRepoIdFromQuery } from '../../../../lib/repoIdHelper'

import standard, * as markers from './Markers'
import MemoTree from './MemoTree'
import { withRouter } from 'next/router'

const styles = {
  tooling: css({
    display: 'flex',
    alignItems: 'center',
    paddingBottom: 40,
  }),
}

const getMarker = (name) => {
  return markers[name] || standard
}

const Memo = compose(
  withT,
  withRouter,
)(({ t, editor, node, children, isSelected, router }) => {
  const [showModal, setShowModal] = useState()

  // noOpen flag added when deserializing
  // only new memos trigger the modal automatically
  useEffect(() => {
    !node.data.get('noOpen') && open()
  }, [])

  const persistData = (key, value) =>
    editor.change((change) => {
      change.setNodeByKey(node.key, {
        data: node.data.set(key, value),
      })
    })

  const pickMarker = (name) => (e) => {
    e?.preventDefault()
    persistData('marker', name)
  }

  const open = (e) => {
    e?.preventDefault()
    setShowModal(true)
  }

  const close = (e) => {
    e?.preventDefault()
    setShowModal(false)
  }

  const remove = (e) => {
    e?.preventDefault()
    editor.change((change) => {
      change.unwrapInline(node.type)
    })
  }

  const onPublished = (memo) => {
    const isRoot = !memo.parentIds.length
    if (isRoot) {
      persistData('parentId', memo.id)
    }
  }

  const { commitId } = router.query
  const repoId = getRepoIdFromQuery(router.query)
  const discussionEnabled = commitId !== 'new'
  const parentId = node.data.get('parentId')

  const marker = node.data.get('marker')
  const { Marker } = getMarker(marker)

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
                .filter((name) => name !== 'default')
                .map((name) => {
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
                label={t('memo/modal/remove')}
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
              <Interaction.P>{t('memo/modal/warning/newDoc')}</Interaction.P>
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
              <MemoIcon />
            </span>
          )
        }),
      ],
    },
    plugins: [
      {
        renderNode(props) {
          const { node } = props
          if (!memo.match(node)) return
          return <Memo {...props} />
        },
      },
    ],
  }
}

export default MemoModule
