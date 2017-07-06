import * as React from 'react'
import { Component } from 'react'
import * as PropTypes from 'prop-types'
import { gql, graphql } from 'react-apollo'
import { compose } from 'redux'
import withT from '../../lib/withT'
import { errorToString } from '../../lib/utils/errors'
import { meQuery } from '../../lib/withMe'
import { InlineSpinner } from '../Spinner'

import { A } from '@project-r/styleguide'

interface AnyObject {
  [key: string]: any
}

class SignOut extends Component<AnyObject, AnyObject> {
  public static propTypes = {
    signOut: PropTypes.func.isRequired
  }

  constructor(props: any) {
    super(props)
    this.state = {
      loading: false
    }
  }
  public render() {
    const { t } = this.props
    const { loading, error } = this.state

    return (
      <span>
        <A
          href="#"
          onClick={(e: any) => {
            e.preventDefault()
            if (loading) {
              return
            }
            this.setState(() => ({
              loading: true
            }))
            this.props
              .signOut()
              .then(({ data }: any) => {
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
              .catch((err: any) => {
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
    props: ({ mutate, ownProps }) => ({
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

export default compose(withSignOut, withT)(SignOut)
