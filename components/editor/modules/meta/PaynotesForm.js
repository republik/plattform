import React from 'react'

import { A, Label } from '@project-r/styleguide'
import MdClose from 'react-icons/lib/md/close'
import MdAdd from 'react-icons/lib/md/add'
import { css } from 'glamor'

import withT from '../../../../lib/withT'
import PaynoteForm from './PaynoteForm'

const styles = {
  header: css({
    paddingBottom: 15
  }),
  title: css({
    paddingTop: 5,
    display: 'inline-block'
  }),
  close: css({
    float: 'right'
  }),
  add: css({
    fontSize: 14
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
      titleTop: '',
      bodyTop: '',
      ctaTop: '',
      titleBottom: '',
      bodyBottom: '',
      ctaBottom: ''
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
          <MdAdd /> Add custom paynotes
        </A>
      ) : (
        <>
          <Label style={{ display: 'block', marginBottom: 5 }}>
            Custom Paynotes
          </Label>
          {paynotes.map((paynote, i) => {
            return (
              <div
                key={i}
                style={{
                  backgroundColor: '#fff',
                  padding: '5px 10px 10px',
                  marginBottom: 5
                }}
              >
                <div {...styles.header}>
                  <Label {...styles.title}>Paynote {i + 1}</Label>
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
          <A href='#add' onClick={addPaynote} {...styles.add}>
            <MdAdd /> new paynote
          </A>
        </>
      )}
    </>
  )
})
