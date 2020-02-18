import React from 'react'

import { A, Checkbox, Label, RawHtml } from '@project-r/styleguide'
import MdClose from 'react-icons/lib/md/close'
import MdAdd from 'react-icons/lib/md/add'
import MdInfoOutline from 'react-icons/lib/md/info-outline'
import { css } from 'glamor'

import withT from '../../../../lib/withT'
import PaynoteForm from './PaynoteForm'
import { DARK_MODE_KEY } from './DarkModeForm'

const styles = {
  title: css({
    display: 'block',
    marginBottom: 5
  }),
  subtitle: css({
    padding: '5px 0',
    fontWeight: 'bold'
  }),
  container: css({
    backgroundColor: '#fff',
    padding: '5px 10px 15px',
    marginBottom: 15
  }),
  close: css({
    float: 'right'
  }),
  add: css({
    marginTop: 10,
    fontSize: 14
  }),
  help: css({
    margin: '0 0 10px'
  }),
  checkbox: css({
    display: 'inline-block',
    marginRight: 10
  })
}

const PAYNOTE_KEY = 'paynotes'
const TARGETS = ['hasActiveMembership', 'isEligibleForTrial']

const DEFAULT_TARGET = {
  hasActiveMembership: false,
  isEligibleForTrial: true
}

const DEFAULT_PAYNOTE = {
  content: '',
  cta: undefined,
  button: {
    label: '',
    link: ''
  },
  secondary: {
    prefix: '',
    label: '',
    link: ''
  }
}

const TargetForm = withT(({ t, data, onInputChange }) => (
  <div>
    <Label style={{ display: 'block', paddingBottom: 5 }}>
      {t('metaData/paynote/form/target/title')}
    </Label>
    {TARGETS.map((target, i) => {
      return (
        <div key={i} {...styles.checkbox}>
          <Checkbox
            checked={data[target]}
            onChange={(e, value) => onInputChange({ [target]: value })}
          >
            {t(`metaData/paynote/form/target/${target}`)}
          </Checkbox>
        </div>
      )
    })}
  </div>
))

export default withT(({ t, editor, node }) => {
  const paynotes = node.data.get(PAYNOTE_KEY) || []

  const onPaynotesChange = newPaynotes => {
    editor.change(change => {
      change.setNodeByKey(node.key, {
        data:
          newPaynotes !== null && newPaynotes.length
            ? node.data.set(PAYNOTE_KEY, newPaynotes)
            : node.data.remove(PAYNOTE_KEY)
      })
    })
  }

  const addPaynote = e => {
    e.preventDefault()
    onPaynotesChange(
      paynotes.concat({
        target: DEFAULT_TARGET,
        before: DEFAULT_PAYNOTE,
        after: DEFAULT_PAYNOTE
      })
    )
  }

  const removePaynote = i => e => {
    e.preventDefault()
    onPaynotesChange(paynotes.slice(0, i).concat(paynotes.slice(i + 1)))
  }

  const editPaynote = (i, paynote, attr) => newAttrs => {
    const editedPaynote = {
      ...paynote,
      [attr]: {
        ...paynote[attr],
        ...newAttrs
      }
    }

    onPaynotesChange(
      paynotes
        .slice(0, i)
        .concat(editedPaynote)
        .concat(paynotes.slice(i + 1))
    )
  }

  return (
    <>
      {!paynotes.length ? (
        <A href='#add' onClick={addPaynote}>
          <MdAdd /> {t('metaData/paynotes/add')}
        </A>
      ) : (
        <>
          <Label {...styles.title}>{t('metaData/paynotes/title')}</Label>
          {paynotes.map((paynote, i) => {
            return (
              <div key={i} {...styles.container}>
                <A href='#remove' onClick={removePaynote(i)} {...styles.close}>
                  <MdClose size={20} fill='#000' />
                </A>
                <div>
                  <Label {...styles.subtitle}>
                    {t('metaData/paynotes/index', { index: i + 1 })}
                  </Label>
                  <br />
                  <br />
                  <TargetForm
                    data={paynote.target}
                    onInputChange={editPaynote(i, paynote, 'target')}
                  />
                </div>
                <br />
                <Label {...styles.subtitle}>
                  {t('metaData/paynotes/before')}
                </Label>
                <PaynoteForm
                  data={paynote.before}
                  onInputChange={editPaynote(i, paynote, 'before')}
                />
                <br />
                <br />
                <Label {...styles.subtitle}>
                  {t('metaData/paynotes/after')}
                </Label>
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
                  __html: t('metaData/paynotes/help')
                }}
              />
            </small>
          </p>
          <A href='#add' onClick={addPaynote} {...styles.add}>
            <MdAdd /> {t('metaData/paynotes/new')}
          </A>
        </>
      )}
    </>
  )
})
