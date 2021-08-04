import React, { useState, useEffect, useRef } from 'react'
import { css } from 'glamor'
import MarkdownSerializer from 'slate-mdast-serializer'
import AutosizeInput from 'react-textarea-autosize'
import MemoIcon from 'react-icons/lib/md/comment'
import DeleteIcon from 'react-icons/lib/md/delete-forever'

import {
  Field,
  Overlay,
  OverlayToolbar,
  OverlayBody,
  useColorContext,
  fontStyles,
  IconButton,
  Button,
  Label
} from '@project-r/styleguide'

import { EditIcon, CheckIcon } from '@project-r/styleguide/icons'

import { matchInline, createInlineButton, buttonStyles } from '../../utils'

const fadeIn = css.keyframes('fadeIn', {
  '0%': { opacity: 0 },
  '100%': { opacity: 1 }
})

const styles = {
  contextMenu: css({
    position: 'absolute',
    maxWidth: 300,
    padding: 8,
    cursor: 'pointer',
    opacity: 0,
    animation: `${fadeIn} 150ms ease-in 150ms`,
    animationFillMode: 'forwards',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 6
  }),
  contextMenuContainer: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }),
  memo: css({
    marginBottom: 16,
    ...fontStyles.sansSerifRegular16
  }),
  colorSelectors: css({
    display: 'flex',
    alignItems: 'center',
    marginRight: 24
  }),
  autoSize: css({
    paddingTop: '7px !important',
    paddingBottom: '6px !important'
  }),
  marker: css({
    borderRadius: '100%',
    marginRight: 6,
    width: 24,
    height: 24,
    verticalAlign: 'middle',
    cursor: 'pointer'
  })
}

const markerColors = {
  yellow: [255, 255, 0],
  pink: [255, 100, 255],
  green: [0, 255, 0],
  blue: [0, 230, 230]
}

const getMarkerColor = color => {
  return markerColors[color] || [255, 255, 0]
}

const serialize = string => {
  try {
    return JSON.stringify(string)
  } catch (e) {
    console.warn('Unable to serialize string', { string })
    return string
  }
}

const deserialize = json => {
  try {
    return JSON.parse(json || '""')
  } catch (e) {
    console.warn('Unable to deserialize json', { json })
    return json
  }
}

const Memo = ({ editor, node, children, isSelected, me }) => {
  const [colorScheme] = useColorContext()
  const markedTextRef = useRef()
  const [showModal, setShowModal] = useState()
  const [markedTextHeight, setMarkedTextHeight] = useState(0)
  const [memoRef, setMemoRef] = useState()
  const [memo, setMemo] = useState()
  const [color, setColor] = useState()
  const [dirty, setDirty] = useState()

  // If Memo is untouched – flag is missing – open overlay.
  useEffect(() => {
    !node.data.get('touched') && open()
  }, [node.data.get('touched')])

  useEffect(() => {
    reset()
  }, [])

  /* useEffect(() => {
    if (memoRef) {
      memoRef.focus()
      memoRef.setSelectionRange(memoRef.value.length, memoRef.value.length)
    }
  }, [memoRef]) */

  const change = (e, value) => {
    e?.preventDefault?.()
    value !== memo && setDirty(true)
    setMemo(value)
  }

  const colorize = color => e => {
    e?.preventDefault?.()
    setColor(color)
  }

  const submit = e => {
    e?.preventDefault?.()
    editor.change(change => {
      change.setNodeByKey(node.key, {
        data: node.data.merge({
          memo: serialize(memo),
          color,
          touched: true
        })
      })
    })
    setShowModal(false)
  }

  const reset = e => {
    e?.preventDefault?.()
    setMemo(deserialize(node.data.get('memo')))
    setColor(node.data.get('color'))
  }

  const open = e => {
    e?.preventDefault?.()
    setDirty(false)
    setShowModal(true)
  }

  const close = e => {
    e?.preventDefault?.()
    reset()
    setShowModal(false)
  }

  const remove = e => {
    e?.preventDefault?.()
    editor.change(change => {
      change.unwrapInline(node.type)
    })
  }

  return (
    <>
      {showModal && (
        <Overlay mUpStyle={{ maxWidth: 720, minHeight: 0 }} onClose={close}>
          <OverlayToolbar onClose={close} />
          <OverlayBody>
            <div {...styles.colorSelectors}>
              {Object.keys(markerColors).map((markerColor, index) => (
                <div
                  key={`marker-color-${index}`}
                  {...styles.marker}
                  style={{
                    backgroundColor: `rgb(${getMarkerColor(markerColor).join(
                      ','
                    )})`
                  }}
                  onClick={colorize(markerColor)}
                />
              ))}
            </div>
            <Field
              label={'Memo'}
              name='memo'
              value={memo}
              onChange={change}
              renderInput={({ ref, ...inputProps }) => (
                <AutosizeInput
                  {...inputProps}
                  {...styles.autoSize}
                  inputRef={ref}
                />
              )}
            />
            <div>
              <Button onClick={submit} primary>
                Übernehmen
              </Button>
              <Button onClick={remove}>Entfernen</Button>
            </div>
          </OverlayBody>
        </Overlay>
      )}
      <span
        ref={markedTextRef}
        style={{
          backgroundColor: isSelected
            ? `rgb(${getMarkerColor(color).join(',')},0.8)`
            : `rgba(${getMarkerColor(color).join(',')},0.4)`,
          paddingTop: '.2em',
          paddingBottom: '.2em'
        }}
        onDoubleClick={open}
      >
        {children}
      </span>
    </>
  )
}

const MemoModule = ({ rule, TYPE }) => {
  const memo = {
    match: matchInline(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, { visitChildren, context }) => {
      console.log('fromMdast', { node, data: node.data, memo: node.data?.memo })

      return {
        kind: 'inline',
        type: TYPE,
        data: {
          ...node.data,
          touched: true
        },
        nodes: visitChildren(node)
      }
    },
    toMdast: (object, index, parent, { visitChildren }) => {
      console.log('toMdast', { object })

      return {
        type: 'span',
        data: {
          type: TYPE,
          memo: object.data?.memo,
          color: object.data?.color
        },
        children: visitChildren(object)
      }
    }
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
          type: TYPE,
          parentTypes: rule.editorOptions?.parentTypes
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
          if (!memo.match(rest.node)) return

          return <Memo {...rest}>{children}</Memo>
        }
      }
    ]
  }
}

export default MemoModule
