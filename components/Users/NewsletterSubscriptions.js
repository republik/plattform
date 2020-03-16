import React, { Component } from 'react'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import { MdDone as SaveIcon } from 'react-icons/md'

import withT from '../../lib/withT'

import {
  InlineSpinner,
  Loader,
  Checkbox
} from '@project-r/styleguide'

import {
  Section,
  SectionTitle,
  TextButton
} from '../Display/utils'

export const UPDATE_NEWSLETTER_SUBSCRIPTION = gql`
  mutation updateNewsletterSubscription(
    $userId: ID!
    $name: NewsletterName!
    $subscribed: Boolean!
  ) {
    updateNewsletterSubscription(
      userId: $userId
      name: $name
      subscribed: $subscribed
    ) {
      id
    }
  }
`

export const GET_NEWSLETTER_SUBSCRIPTION = gql`
  query newsletterSubscriptions($id: String) {
    user(slug: $id) {
      id
      newsletterSettings {
        status
        subscriptions {
          id
          name
          subscribed
          isEligible
        }
      }
    }
  }
`

class UpdateSubscription extends Component {
  constructor(props) {
    super(props)
    const {
      subscription: { subscribed }
    } = this.props

    this.state = {
      value: subscribed
    }

    this.handleSubmit = mutation => event => {
      event.preventDefault()
      mutation({
        variables: {
          subscribed: this.state.value
        }
      })
    }
  }

  render() {
    const {
      t,
      user: { id },
      subscription: { name, status, isEligible, subscribed }
    } = this.props
    const { value } = this.state
    return (
      <Mutation
        mutation={UPDATE_NEWSLETTER_SUBSCRIPTION}
        variables={{ userId: id, name, status }}
        refetchQueries={({
          data: { updateNewsletterSubscription }
        }) => [
          {
            query: GET_NEWSLETTER_SUBSCRIPTION,
            variables: {
              id: updateNewsletterSubscription.id
            }
          }
        ]}
      >
        {(mutation, { loading }) => {
          return (
            <form onSubmit={this.handleSubmit(mutation)}>
              <p>
                <Checkbox
                  checked={value}
                  disabled={
                    (!isEligible && !value) || loading
                  }
                  onChange={(_, checked) =>
                    this.setState({
                      value: checked
                    })
                  }
                >
                  {t(
                    `account/newsletterSubscriptions/${name}/label`
                  )}
                </Checkbox>
                <span style={{ float: 'right' }}>
                  {loading ? (
                    <InlineSpinner size={22} />
                  ) : subscribed !== value ? (
                    <TextButton type="submit">
                      <SaveIcon size={22} />
                    </TextButton>
                  ) : (
                    undefined
                  )}
                </span>
              </p>
            </form>
          )
        }}
      </Mutation>
    )
  }
}

const NewsletterSubscriptions = ({ t, userId }) => (
  <Query
    query={GET_NEWSLETTER_SUBSCRIPTION}
    variables={{ id: userId }}
  >
    {({ data, loading, error }) => {
      const isInitialLoading =
        loading && !(data && data.user)
      return (
        <Loader
          loading={isInitialLoading}
          error={error}
          render={() => {
            const { user } = data
            const {
              subscriptions,
              status
            } = user.newsletterSettings
            const hasNonEligibleSubscription = subscriptions.some(
              newsletter => !newsletter.isEligible
            )

            return (
              <Section>
                <SectionTitle>
                  Abonnierte Newsletter
                </SectionTitle>
                Status: {status}<br />
                {hasNonEligibleSubscription &&
                  'Es können nur User mit aktiver Membership die Republik-Newsletter abonnieren.'}
                {subscriptions.map(
                    (subscription, index) => (
                      <UpdateSubscription
                        t={t}
                        key={`${
                          subscription.name
                        }-${index}-${
                          subscription.subscribed
                        }`}
                        user={user}
                        subscription={subscription}
                      />
                    )
                  )}
              </Section>
            )
          }}
        />
      )
    }}
  </Query>
)

export default withT(NewsletterSubscriptions)
