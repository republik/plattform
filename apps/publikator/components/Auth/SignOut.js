import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import withT from '../../lib/withT'
import { errorToString } from '../../lib/utils/errors'
import { meQuery } from '../../lib/withMe'

import { A, InlineSpinner } from '@project-r/styleguide'

class SignOut extends Component {
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
          href='#'
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
              .catch(error => {
                this.setState(() => ({
                  error: errorToString(error),
                  loading: false
                }))
              })
          }}
        >
          {t('signOut/label')}
        </A>
        {loading && <InlineSpinner size={25} />}
        {!!error && ` – ${error}`}
      </span>
    )
  }
}

SignOut.propTypes = {
  signOut: PropTypes.func.isRequired
}

const signOutMutation = gql`
  mutation signOut {
    signOut
  }
`

export const withSignOut = compose(
  graphql(signOutMutation, {
    props: ({ mutate, ownProps }) => ({
      signOut: () =>
        mutate({
          refetchQueries: [
            {
              query: meQuery
            }
          ]
        })
    })
  })
)

export default compose(
  withSignOut,
  withT
)(SignOut)
