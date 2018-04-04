import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { compose } from 'redux'
import withT from '../../lib/withT'
import { errorToString } from '../../lib/utils/errors'
import { meQuery } from '../../lib/withMe'
import { InlineSpinner } from '../Spinner'

import { A } from '@project-r/styleguide'

class SignOut extends Component {
  static propTypes = {
    signOut: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      loading: false
    }
  }
  render() {
    const { t } = this.props
    const { loading, error } = this.state

    return (
      <span>
        <A
          href="#"
          onClick={e => {
            e.preventDefault()
            if (loading) {
              return
            }
            this.setState(() => ({
              loading: true
            }))
            this.props
              .signOut()
              .then(({ data }) => {
                if (data) {
                  this.setState(() => ({
                    loading: false
                  }))
                } else {
                  this.setState(() => ({
                    error: t('signOut/error'),
                    loading: false
                  }))
                }
              })
              .catch(err => {
                this.setState(() => ({
                  error: errorToString(err),
                  loading: false
                }))
              })
          }}
        >
          {t('signOut/label')}
        </A>
        {loading && <InlineSpinner size={25} />}
        {!!error && ` — ${error}`}
      </span>
    )
  }
}

const signOutMutation = gql`
  mutation signOut {
    signOut
  }
`

export const withSignOut = compose(
  graphql(signOutMutation, {
    props: ({ mutate }) => ({
      signOut: () => {
        if (mutate) {
          mutate({
            refetchQueries: [
              {
                query: meQuery
              }
            ]
          })
        }
      }
    })
  })
)

export default compose(withSignOut, withT)(
  SignOut
)
