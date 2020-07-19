import React from 'react'

import { A, Radio, Label, RawHtml, Interaction } from '@project-r/styleguide'
import MdClose from 'react-icons/lib/md/close'
import MdAdd from 'react-icons/lib/md/add'
import MdInfoOutline from 'react-icons/lib/md/info-outline'
import { css } from 'glamor'

import withT from '../../../../lib/withT'
import PaynoteForm from './PaynoteForm'

const styles = {
  title: css({
    display: 'block',
    marginBottom: 5
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
    <Interaction.H3>{t('metaData/paynote/form/target/title')}</Interaction.H3>
    {TARGETS.map((target, i) => {
      return (
        <div key={i} style={{ marginBottom: 10 }}>
          <Label style={{ display: 'block', marginBottom: 5 }}>
            {t(`metaData/paynote/form/target/${target}`)}
          </Label>
          {[true, false, undefined].map(value => (
            <Radio
              key={String(value)}
              value={String(value)}
              checked={data[target] === value}
              onChange={() => onInputChange({ [target]: value })}
              style={{ marginRight: 20 }}
            >
              {t(`metaData/paynote/form/target/value/${value}`)}
            </Radio>
          ))}
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
                  <Label>
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
