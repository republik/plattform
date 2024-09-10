import {
  A,
  Radio,
  Label,
  RawHtml,
  Interaction,
  Dropdown,
  Checkbox,
} from '@project-r/styleguide'
import { 
  IconAdd as MdAdd,
  IconClose as MdClose,
  IconInfoOutline as MdInfoOutline 
} from '@republik/icons'
import { css } from 'glamor'

import withT from '../../../../lib/withT'
import PaynoteForm from './PaynoteForm'
import UIForm from '../../UIForm'
import {
  MetaOptionGroup,
  MetaOptionGroupTitle,
  MetaSection,
  MetaSectionTitle
} from "../../../MetaDataForm/components/Layout";

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
const PAYNOTE_MODE_KEY = 'paynoteMode'
const TARGETS = ['hasActiveMembership', 'isEligibleForTrial']

const MODE_KEYS = {
  AUTO: 'auto',
  BUY: 'button',
  TRY: 'trialForm',
  CUSTOM: 'custom',
  NONE: 'noPaynote',
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

const EMPTY_DEFAULT_PAYNOTE = [
  {
    target: DEFAULT_TARGET,
    before: { ...EMPTY_PAYNOTE, cta: 'button' },
    after: { ...EMPTY_PAYNOTE, cta: 'button' },
  },
]

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
  const paynotesMode = node.data.get(PAYNOTE_MODE_KEY)

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

  const onModeChange = (value) => {
    if (value === MODE_KEYS.AUTO) {
      editor.change((change) => {
        change.setNodeByKey(node.key, {
          data: node.data.remove(PAYNOTE_KEY).remove(PAYNOTE_MODE_KEY),
        })
      })
    } else if (value === MODE_KEYS.CUSTOM) {
      editor.change((change) => {
        change.setNodeByKey(node.key, {
          data: node.data
            .set(PAYNOTE_KEY, EMPTY_DEFAULT_PAYNOTE)
            .remove(PAYNOTE_MODE_KEY),
        })
      })
    } else {
      // button, trialForm, none
      editor.change((change) => {
        change.setNodeByKey(node.key, {
          data: node.data.remove(PAYNOTE_KEY).set(PAYNOTE_MODE_KEY, value),
        })
      })
    }
  }

  const dropdownMode =
    paynotesMode || (paynotes?.length ? MODE_KEYS.CUSTOM : MODE_KEYS.AUTO)

  return (
    <MetaSection>
      <MetaSectionTitle>{t('metaData/paynotes')}</MetaSectionTitle>
      <UIForm getWidth={() => '50%'}>
        <Dropdown
          black
          label={t('metaData/paynotes/dropdown')}
          items={modes}
          value={dropdownMode || null}
          onChange={({ value }) => {
            onModeChange(value)
          }}
        />
      </UIForm>
      {dropdownMode === MODE_KEYS.CUSTOM && (
        <>
          <MetaOptionGroupTitle>{t('metaData/paynotes/title')}</MetaOptionGroupTitle>
          <MetaOptionGroup>
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
          </MetaOptionGroup>
        </>
      )}
    </MetaSection>
  )
})
