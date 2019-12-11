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
  header: css({
    paddingBottom: 15
  }),
  label: css({
    paddingTop: 5,
    display: 'inline-block'
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
      isTrynote: false,
      beforeTitle: '',
      beforeBody: '',
      beforeButton: '',
      afterTitle: '',
      afterBody: '',
      afterButton: ''
    }
    onPaynotesChange(paynotes.concat(templatePaynote))
  }

  const removePaynote = i => e => {
    e.preventDefault()
    onPaynotesChange(paynotes.slice(0, i).concat(paynotes.slice(i + 1)))
  }

  const editPaynote = (i, paynote) => newAttrs => {
    onPaynotesChange(
      paynotes
        .slice(0, i)
        .concat({
          ...paynote,
          ...newAttrs
        })
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
                <div {...styles.header}>
                  <Label {...styles.label}>
                    {t('metaData/paynotes/single')} {i + 1}
                  </Label>
                  <A
                    href='#remove'
                    onClick={removePaynote(i)}
                    {...styles.close}
                  >
                    <MdClose size={20} fill='#000' />
                  </A>
                </div>
                <PaynoteForm
                  data={paynote}
                  onInputChange={editPaynote(i, paynote)}
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
