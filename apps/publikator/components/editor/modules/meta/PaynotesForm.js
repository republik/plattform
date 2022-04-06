import React, { useEffect, useState } from 'react'
import {
  A,
  Radio,
  Label,
  RawHtml,
  Interaction,
  Dropdown,
  Checkbox,
} from '@project-r/styleguide'
import MdClose from 'react-icons/lib/md/close'
import MdAdd from 'react-icons/lib/md/add'
import MdInfoOutline from 'react-icons/lib/md/info-outline'
import { css } from 'glamor'

import withT from '../../../../lib/withT'
import PaynoteForm from './PaynoteForm'
import UIForm from '../../UIForm'

const styles = {
  paynotes: css({
    paddingBottom: 300,
  }),
  title: css({
    display: 'block',
    marginBottom: 5,
  }),
  paynote: css({
    backgroundColor: '#fff',
    padding: '5px 10px 15px',
    marginBottom: 15,
  }),
  close: css({
    float: 'right',
  }),
  add: css({
    marginTop: 10,
    fontSize: 14,
  }),
  help: css({
    margin: '0 0 10px',
  }),
}

const PAYNOTE_KEY = 'paynotes'
const PAYNOTE_CTA_KEY = 'paynoteCta'
const TARGETS = ['hasActiveMembership', 'isEligibleForTrial']
const MODE_KEYS = {
  AUTO: 'auto',
  BUY: 'button',
  TRY: 'trialForm',
  CUSTOM: 'custom',
  NONE: 'none',
}
const MODES = [
  MODE_KEYS.AUTO,
  MODE_KEYS.BUY,
  MODE_KEYS.TRY,
  MODE_KEYS.CUSTOM,
  MODE_KEYS.NONE,
]

const DEFAULT_TARGET = {
  hasActiveMembership: false,
}

const EMPTY_PAYNOTE = {
  content: '',
  button: {
    label: '',
    link: '',
  },
  secondary: {
    prefix: '',
    label: '',
    link: '',
  },
}

const isEmptyPaynote = (paynote) =>
  !paynote.content &&
  !paynote.cta &&
  !paynote.button.label &&
  !paynote.button.link &&
  !paynote.secondary.label &&
  !paynote.secondary.link

const isEmptyPaynotes = (paynotes) =>
  paynotes?.length === 1 &&
  isEmptyPaynote(paynotes[0].before) &&
  isEmptyPaynote(paynotes[0].after) &&
  Object.keys(paynotes[0].target).length === 0

const TargetForm = withT(
  ({ t, isFormat, target, inherit, onTargetChange, onInheritChange }) => (
    <>
      <Interaction.H3>{t('metaData/paynote/form/target/title')}</Interaction.H3>
      {isFormat && (
        <>
          <br />
          <Checkbox
            checked={inherit}
            onChange={(_, checked) => {
              console.log({ checked })
              onInheritChange(checked)
            }}
          >
            Beitragstörer
          </Checkbox>
          <br />
          <br />
        </>
      )}
      {TARGETS.map((tgt, i) => {
        return (
          <div key={i} style={{ marginBottom: 10 }}>
            <Label style={{ display: 'block', marginBottom: 5 }}>
              {t(`metaData/paynote/form/target/${tgt}`)}
            </Label>
            {[true, false, undefined].map((value) => (
              <Radio
                key={String(value)}
                value={String(value)}
                checked={target[tgt] === value}
                onChange={() => onTargetChange({ [tgt]: value })}
                style={{ marginRight: 20 }}
              >
                {t(`metaData/paynote/form/target/value/${value}`)}
              </Radio>
            ))}
          </div>
        )
      })}
    </>
  ),
)

export default withT(({ t, editor, node, isFormat }) => {
  const paynotes = node.data.get(PAYNOTE_KEY) || []
  const paynotesCta = node.data.get(PAYNOTE_CTA_KEY)
  const [mode, setMode] = useState()

  const modes = MODES.map((value) => ({
    value,
    text: t(`metaData/paynotes/mode/${value}`),
  }))

  const onKeyChange = (key) => (value) => {
    editor.change((change) => {
      change.setNodeByKey(node.key, {
        data:
          value === null ||
          value === undefined ||
          (Array.isArray(value) && value.length === 0)
            ? node.data.remove(key)
            : node.data.set(key, value),
      })
    })
  }

  const onPaynotesChange = onKeyChange(PAYNOTE_KEY)

  const addPaynote = (e) => {
    e?.preventDefault()
    onPaynotesChange(
      paynotes.concat({
        target: DEFAULT_TARGET,
        before: { ...EMPTY_PAYNOTE, cta: 'button' },
        after: { ...EMPTY_PAYNOTE, cta: 'button' },
      }),
    )
  }

  const removePaynote = (i) => (e) => {
    e.preventDefault()
    onPaynotesChange(paynotes.slice(0, i).concat(paynotes.slice(i + 1)))
  }

  const editPaynote = (i, paynote, attr, direct) => (newAttrs) => {
    const editedPaynote = direct
      ? {
          ...paynote,
          [attr]: newAttrs,
        }
      : {
          ...paynote,
          [attr]: {
            ...paynote[attr],
            ...newAttrs,
          },
        }

    onPaynotesChange(
      paynotes
        .slice(0, i)
        .concat(editedPaynote)
        .concat(paynotes.slice(i + 1)),
    )
  }

  // set initial mode base on paynotes configuration
  useEffect(() => {
    if (paynotesCta) {
      // 'try' or 'buy'
      setMode(paynotesCta)
    } else if (!paynotes?.length) {
      setMode(MODE_KEYS.AUTO)
    } else {
      if (isEmptyPaynotes(paynotes)) {
        setMode(MODE_KEYS.NONE)
      } else {
        setMode(MODE_KEYS.CUSTOM)
      }
    }
  }, [])

  const onModeChange = (value) => {
    setMode(value)
    if (value === MODE_KEYS.AUTO) {
      editor.change((change) => {
        change.setNodeByKey(node.key, {
          data: node.data.remove(PAYNOTE_KEY).remove(PAYNOTE_CTA_KEY),
        })
      })
    } else if (value === MODE_KEYS.BUY) {
      editor.change((change) => {
        change.setNodeByKey(node.key, {
          data: node.data.remove(PAYNOTE_KEY).set(PAYNOTE_CTA_KEY, value),
        })
      })
    } else if (value === MODE_KEYS.TRY) {
      editor.change((change) => {
        change.setNodeByKey(node.key, {
          data: node.data.remove(PAYNOTE_KEY).set(PAYNOTE_CTA_KEY, value),
        })
      })
    } else if (value === MODE_KEYS.NONE) {
      editor.change((change) => {
        change.setNodeByKey(node.key, {
          data: node.data
            .set(PAYNOTE_KEY, [
              {
                target: {},
                before: EMPTY_PAYNOTE,
                after: EMPTY_PAYNOTE,
              },
            ])
            .remove(PAYNOTE_CTA_KEY),
        })
      })
    } else if (value === MODE_KEYS.CUSTOM) {
      editor.change((change) => {
        change.setNodeByKey(node.key, {
          data: node.data
            .set(PAYNOTE_KEY, [
              {
                target: DEFAULT_TARGET,
                before: { ...EMPTY_PAYNOTE, cta: 'button' },
                after: { ...EMPTY_PAYNOTE, cta: 'button' },
              },
            ])
            .remove(PAYNOTE_CTA_KEY),
        })
      })
    }
  }

  return (
    <div {...styles.paynotes}>
      <UIForm getWidth={() => '50%'}>
        <Dropdown
          black
          label={t('metaData/paynotes/dropdown')}
          items={modes}
          value={mode || null}
          onChange={({ value }) => {
            onModeChange(value)
          }}
        />
      </UIForm>
      {mode === MODE_KEYS.CUSTOM && (
        <>
          <Label {...styles.title}>{t('metaData/paynotes/title')}</Label>
          {paynotes.map((paynote, i) => {
            return (
              <div key={i} {...styles.paynote}>
                <A href='#remove' onClick={removePaynote(i)} {...styles.close}>
                  <MdClose size={20} fill='#000' />
                </A>
                <div>
                  <Label>
                    {t('metaData/paynotes/index', { index: i + 1 })}
                  </Label>
                  <br />
                  <br />
                  <TargetForm
                    isFormat={isFormat}
                    target={paynote.target}
                    inherit={paynote.inherit}
                    onTargetChange={editPaynote(i, paynote, 'target')}
                    onInheritChange={editPaynote(i, paynote, 'inherit', true)}
                  />
                  <br />
                  <br />
                </div>
                <br />
                <Interaction.H3>{t('metaData/paynotes/before')}</Interaction.H3>
                <PaynoteForm
                  data={paynote.before}
                  onInputChange={editPaynote(i, paynote, 'before')}
                />
                <br />
                <br />
                <Interaction.H3>{t('metaData/paynotes/after')}</Interaction.H3>
                <PaynoteForm
                  data={paynote.after}
                  onInputChange={editPaynote(i, paynote, 'after')}
                />
              </div>
            )
          })}
          <p {...styles.help}>
            <small>
              <MdInfoOutline style={{ verticalAlign: 'sub' }} />{' '}
              <RawHtml
                dangerouslySetInnerHTML={{
                  __html: t('metaData/paynotes/help'),
                }}
              />
            </small>
          </p>
          <A href='#add' onClick={addPaynote} {...styles.add}>
            <MdAdd /> {t('metaData/paynotes/new')}
          </A>
        </>
      )}
    </div>
  )
})
