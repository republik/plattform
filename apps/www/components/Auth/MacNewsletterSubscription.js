import { Component, Fragment } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

import { Button, InlineSpinner } from '@project-r/styleguide'

import withT from '../../lib/withT'

import Consents, { getConsentsError } from '../Pledge/Consents'
import ErrorMessage from '../ErrorMessage'
import { withRouter } from 'next/router'

class NewsletterSubscription extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    const { t, updateNewsletterSubscription, email, router } = this.props
    const { consents } = this.state

    const requiredConsents = ['PRIVACY']
    const consentsError = getConsentsError(t, requiredConsents, consents)
    const error = this.state.error || (this.state.dirty && consentsError)

    return (
      <Fragment>
        <div style={{ margin: '20px 0', textAlign: 'left' }}>
          <Consents
            accepted={consents}
            required={requiredConsents}
            onChange={(keys) => {
              this.setState({
                consents: keys,
                error: undefined,
              })
            }}
          />
        </div>
        {!!error && <ErrorMessage error={error} />}
        <br />
        {this.state.updating ? (
          <div style={{ textAlign: 'center' }}>
            <InlineSpinner />
          </div>
        ) : (
          <div style={{ opacity: consentsError ? 0.5 : 1 }}>
            <Button
              primary
              onClick={() => {
                if (consentsError) {
                  this.setState({ dirty: true })
                  return
                }
                this.setState({ updating: true }, () => {
                  updateNewsletterSubscription({
                    consents,
                  })
                    .then(() =>
                      router.replace({
                        pathname: '/mitteilung',
                        query: {
                          type: 'email-confirmed',
                          email,
                          context: this.props.context,
                        },
                      }),
                    )
                    .catch((error) => {
                      this.setState({
                        updating: false,
                        error,
                      })
                    })
                })
              }}
            >
              {t('macNewsletterSubscription/button')}
            </Button>
          </div>
        )}
      </Fragment>
    )
  }
}

const mutation = gql`
  mutation updateNewsletterSubscriptionWithMac(
    $name: NewsletterName!
    $subscribed: Boolean!
    $email: String!
    $mac: String!
    $consents: [String!]
  ) {
    updateNewsletterSubscription(
      name: $name
      subscribed: $subscribed
      email: $email
      mac: $mac
      consents: $consents
    ) {
      id
      name
      subscribed
      isEligible
    }
  }
`

export default compose(
  graphql(mutation, {
    props: ({ mutate, ownProps: { name, subscribed, email, mac } }) => ({
      updateNewsletterSubscription: ({ consents }) =>
        mutate({
          variables: {
            name,
            subscribed,
            email,
            mac,
            consents,
          },
        }),
    }),
  }),
  withT,
  withRouter,
)(NewsletterSubscription)
