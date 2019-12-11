import React, { Fragment } from 'react'

import { A, Label } from '@project-r/styleguide'

import withT from '../../../../lib/withT'
import PaynoteForm from './PaynoteForm'

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
    const newPaynote = {
      isTrynote: false,
      titleTop: '',
      bodyTop: '',
      ctaTop: '',
      titleBottom: '',
      bodyBottom: '',
      ctaBottom: ''
    }
    onPaynotesChange(paynotes.concat(newPaynote))
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
      <Label>{paynotes.length} custom paynotes</Label>
      <br />
      <A href='#add' onClick={addPaynote}>
        new paynote
      </A>
      <br />
      <div
        style={{
          backgroundColor: '#fff',
          padding: '5px 10px 10px',
          marginTop: 5
        }}
      >
        {paynotes.map((paynote, i) => {
          return (
            <Fragment key={i}>
              <Label>Paynote {i + 1}</Label> &nbsp;{' '}
              <A href='#remove' onClick={removePaynote(i)}>
                remove paynote
              </A>
              <br />
              <PaynoteForm
                data={paynote}
                onInputChange={editPaynote(i, paynote)}
              />
            </Fragment>
          )
        })}
      </div>
      <br />
      <br />
    </>
  )
})
