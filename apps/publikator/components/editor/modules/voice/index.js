import { useState, useEffect } from 'react'
import compose from 'lodash/flowRight'
import MarkdownSerializer from '@republik/slate-mdast-serializer'
import {
  Overlay,
  OverlayToolbar,
  OverlayBody,
  Label,
  Radio,
} from "@project-r/styleguide";

import { Marker } from '@project-r/styleguide/editor'

import withT from '../../../../lib/withT'
import { matchInline, createInlineButton, buttonStyles } from '../../utils'

import { withRouter } from 'next/router'
import { IconHearing } from "@republik/icons";
import { VOICES } from "../../../../lib/settings";

const Voice = compose(
  withT,
  withRouter,
)(({ editor, node, children }) => {
  const [showModal, setShowModal] = useState()
  const [syntheticVoice, setSyntheticVoice] = useState(node.data.get('syntheticVoice'))

  // noOpen flag added when deserializing
  // only new memos trigger the modal automatically
  useEffect(() => {
    if (!node.data.get('noOpen')) {
      open()
    }
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
          syntheticVoice: syntheticVoice,
        }),
      })

      setShowModal(false)
    })
  }

  const voiceName = VOICES.find(v => syntheticVoice === v.value)?.text || syntheticVoice

  return (
    <>
      {showModal && (
        <Overlay mUpStyle={{ maxWidth: 720, minHeight: 0 }} onClose={close}>
          <OverlayToolbar title='Synthetische Stimme' onClose={close} />
          <OverlayBody>
            <Radio
              checked={!syntheticVoice}
              onChange={() => setSyntheticVoice(undefined)}
              style={{ marginRight: 30 }}
            >
              Keine
            </Radio>
            {VOICES.map((option, i) => (
              <Radio
                key={i}
                checked={syntheticVoice === option.value}
                onChange={() => setSyntheticVoice(option.value)}
                style={{ marginRight: 30 }}
              >
                {option.text}
              </Radio>
            ))}
          </OverlayBody>
        </Overlay>
      )}
      <Marker onDoubleClick={open}>
        {!!syntheticVoice && <span contentEditable={false} style={{ position: 'absolute', left: -100, top: 0 }}>
          <Marker>
            <Label style={{ padding: '0 7px' }}>{voiceName}</Label>
          </Marker>
        </span>}
        {children}
      </Marker>
    </>
  )
})

const VoiceModule = ({ rule, TYPE, context }) => {
  const voice = {
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
        syntheticVoice: object.data?.syntheticVoice,
      },
      children: visitChildren(object),
    }),
  }

  const serializer = new MarkdownSerializer({
    rules: [voice],
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
              <IconHearing />
            </span>
          )
        }),
      ],
    },
    plugins: [
      {
        renderNode({ attributes, ...props }) {
          const { node } = props
          if (!voice.match(node)) return
          return (
            <span {...attributes}>
              <Voice {...props} />
            </span>
          )
        },
      },
    ],
  }
}

export default VoiceModule
