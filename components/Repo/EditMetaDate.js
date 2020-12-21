import React, { useEffect, useState } from 'react'
import { css } from 'glamor'
import MaskedInput from 'react-maskedinput'
import EditIcon from 'react-icons/lib/md/edit'

import { displayDateTime } from './utils'
import { timeParse, timeFormat } from 'd3-time-format'
import { compose, graphql } from 'react-apollo'
import gql from 'graphql-tag'

const loading = css.keyframes({
  'from, to': {
    opacity: 0.5
  },
  '50%': {
    opacity: 1
  }
})

const styles = {
  span: css({
    cursor: 'pointer',
    display: 'block',
    width: '100%',
    height: 16
  }),
  mask: css({
    outline: 'none',
    border: 'none',
    backgroundColor: 'transparent',
    font: 'inherit',
    marginRight: -10,
    '::placeholder': {
      color: '#ccc'
    },
    '[disabled]': {
      animation: `0.4s ${loading} infinite ease-in-out`
    }
  })
}

const dateFormat = '%d.%m.%y %H:%M'
const dateMask = dateFormat.replace('%Y', '1111').replace(/%(d|m|y|H|M)/g, '11')
const parseDate = timeParse(dateFormat)
const formatDate = timeFormat(dateFormat)

const editRepoMeta = gql`
  mutation editRepoMeta($repoId: ID!, $publishDate: DateTime) {
    editRepoMeta(repoId: $repoId, publishDate: $publishDate) {
      id
      meta {
        publishDate
      }
    }
  }
`

const PublishDate = ({ date }) =>
  date ? (
    <span>
      {displayDateTime(date)}{' '}
      <EditIcon style={{ marginTop: -4, marginLeft: 5 }} />
    </span>
  ) : null

const EditMeta = ({ publishDate, repoId, editRepoMeta }) => {
  const [editing, setEditing] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [formValue, setFormValue] = useState(undefined)
  const [ref, setRef] = useState(null)

  useEffect(() => {
    if (ref) {
      ref.focus()
    } else {
      resetForm()
    }
  }, [ref])

  const resetForm = () => {
    setEditing(false)
    setDisabled(false)
    setFormValue(undefined)
  }
  const formattedPublishDate = publishDate
    ? formatDate(new Date(publishDate))
    : ''
  const formattedFormValue =
    formValue !== undefined ? formValue : formattedPublishDate

  return (
    <span {...styles.span} onClick={() => setEditing(true)}>
      {editing ? (
        <MaskedInput
          value={formattedFormValue}
          disabled={disabled}
          ref={setRef}
          {...styles.mask}
          onKeyUp={event => {
            if (event.key === 'Enter') {
              const parsedValue = parseDate(formattedFormValue)
              if (!parsedValue && formattedFormValue !== '') {
                return
              }
              if (formattedPublishDate === formattedFormValue) {
                ref.blur()
              }

              setDisabled(true)
              editRepoMeta({
                repoId,
                publishDate: parsedValue ? parsedValue.toISOString() : null
              })
                .then(() => {
                  resetForm()
                  ref.blur()
                })
                .catch(() => {
                  setDisabled(false)
                })
            }
            if (event.key === 'Escape') {
              ref.blur()
            }
          }}
          onBlur={resetForm}
          onChange={event => setFormValue(event.target.value)}
          placeholderChar={'_'}
          mask={dateMask}
        />
      ) : (
        <PublishDate date={publishDate} />
      )}
    </span>
  )
}

export default compose(
  graphql(editRepoMeta, {
    props: ({ mutate }) => ({
      editRepoMeta: variables => mutate({ variables })
    })
  })
)(EditMeta)
