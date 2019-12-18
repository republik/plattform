import React from 'react'

import { A, Label, RawHtml } from '@project-r/styleguide'
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
    marginBottom: 5
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
    const templatePaynote = {
      title: '',
      body: '',
      cta: 'trialForm',
      button: {
        label: '',
        link: '/angebote'
      }
    }
    onPaynotesChange(
      paynotes.concat({
        before: templatePaynote,
        after: templatePaynote
      })
    )
  }

  const removePaynote = i => e => {
    e.preventDefault()
    onPaynotesChange(paynotes.slice(0, i).concat(paynotes.slice(i + 1)))
  }

  const editPaynote = (i, paynote, position) => newAttrs => {
    const editedPaynote = {
      ...paynote,
      [position]: {
        ...paynote[position],
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
                <PaynoteForm
                  data={paynote.before}
                  name={t('metaData/paynotes/before', { index: i + 1 })}
                  onInputChange={editPaynote(i, paynote, 'before')}
                />
                <br />
                <PaynoteForm
                  data={paynote.after}
                  name={t('metaData/paynotes/after', { index: i + 1 })}
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
