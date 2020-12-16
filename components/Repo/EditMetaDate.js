import React, { Component } from 'react'
import { css } from 'glamor'
import MaskedInput from 'react-maskedinput'

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

class EditMeta extends Component {
  constructor(...args) {
    super(...args)
    this.state = {
      editing: false,
      disabled: false,
      value: undefined
    }
    this.setRef = ref => {
      this.ref = ref
    }
    this.resetState = this.resetState.bind(this)
  }

  resetState() {
    this.setState({
      editing: false,
      value: undefined,
      disabled: false
    })
  }

  render() {
    const { editing, disabled } = this.state
    const { publishDate, repoId, editRepoMeta } = this.props

    const formattedPublishDate = publishDate
      ? formatDate(new Date(publishDate))
      : ''
    let formattedValue =
      this.state.value !== undefined ? this.state.value : formattedPublishDate

    return (
      <span
        {...styles.span}
        onClick={() => {
          this.setState({ editing: true }, () => {
            this.ref.focus()
          })
        }}
      >
        {editing ? (
          <MaskedInput
            value={formattedValue}
            disabled={disabled}
            ref={this.setRef}
            {...styles.mask}
            onKeyUp={event => {
              if (event.key === 'Enter') {
                const parsedValue = parseDate(formattedValue)
                if (!parsedValue && formattedValue !== '') {
                  return
                }
                if (formattedPublishDate === formattedValue) {
                  this.ref.blur()
                }

                this.setState({ disabled: true })
                editRepoMeta({
                  repoId,
                  publishDate: parsedValue ? parsedValue.toISOString() : null
                })
                  .then(this.resetState)
                  .catch(() => {
                    this.setState({ disabled: false })
                  })
                this.ref.blur()
              }
              if (event.key === 'Escape') {
                this.resetState()
              }
            }}
            onBlur={() => {
              if (formattedPublishDate === formattedValue) {
                this.setState({ editing: false, value: undefined })
              }
            }}
            onChange={event => this.setState({ value: event.target.value })}
            placeholderChar={'_'}
            mask={dateMask}
          />
        ) : (
          displayDateTime(publishDate)
        )}
      </span>
    )
  }
}

export default compose(
  graphql(editRepoMeta, {
    props: ({ mutate }) => ({
      editRepoMeta: variables => mutate({ variables })
    })
  })
)(EditMeta)
