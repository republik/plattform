import { Component } from 'react'
import { Query, Mutation } from '@apollo/client/react/components'
import { gql } from '@apollo/client'

import withT from '../../lib/withT'

import { InlineSpinner, Loader, Checkbox } from '@project-r/styleguide'

import { Section, SectionTitle, TextButton } from '../Display/utils'
import ErrorMessage from '../ErrorMessage'
import { IconDone } from '@republik/icons'

export const RESUBSCRIBE_EMAIL = gql`
  mutation resubscribeEmail($userId: ID!) {
    resubscribeEmail(userId: $userId) {
      id
      status
      subscriptions {
        id
        name
        subscribed
        isEligible
      }
    }
  }
`

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
        id
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
      subscription: { subscribed },
    } = this.props

    this.state = {
      value: subscribed,
    }

    this.handleSubmit = (mutation) => (event) => {
      event.preventDefault()
      mutation({
        variables: {
          subscribed: this.state.value,
        },
      })
    }
  }

  render() {
    const {
      t,
      user: { id },
      subscription: { name, status, isEligible, subscribed },
    } = this.props
    const { value } = this.state
    return (
      <Mutation
        mutation={UPDATE_NEWSLETTER_SUBSCRIPTION}
        variables={{ userId: id, name, status }}
        refetchQueries={({ data: { updateNewsletterSubscription } }) => [
          {
            query: GET_NEWSLETTER_SUBSCRIPTION,
            variables: {
              id: updateNewsletterSubscription.id,
            },
          },
        ]}
      >
        {(mutation, { loading }) => {
          return (
            <form onSubmit={this.handleSubmit(mutation)}>
              <p>
                <Checkbox
                  checked={value}
                  disabled={(!isEligible && !value) || loading}
                  onChange={(_, checked) =>
                    this.setState({
                      value: checked,
                    })
                  }
                >
                  {t(`account/newsletterSubscriptions/${name}/label`)}
                </Checkbox>
                <span style={{ float: 'right' }}>
                  {loading ? (
                    <InlineSpinner size={22} />
                  ) : subscribed !== value ? (
                    <TextButton type='submit'>
                      <IconDone size={24} />
                    </TextButton>
                  ) : undefined}
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
  <Query query={GET_NEWSLETTER_SUBSCRIPTION} variables={{ id: userId }}>
    {({ data, loading, error }) => {
      const isInitialLoading = loading && !(data && data.user)
      return (
        <Loader
          loading={isInitialLoading}
          error={error}
          render={() => {
            const { user } = data
            const { subscriptions, status } = user.newsletterSettings
            const hasNonEligibleSubscription = subscriptions.some(
              (newsletter) => !newsletter.isEligible,
            )

            return (
              <Section>
                <SectionTitle>Abonnierte Newsletter</SectionTitle>
                <div>
                  <span style={{ marginRight: 10 }}>Status: {status}</span>
                  {status !== 'subscribed' && (
                    <Mutation mutation={RESUBSCRIBE_EMAIL}>
                      {(mutate, { loading, error }) => {
                        if (error) return <ErrorMessage error={error} />

                        return (
                          <div>
                            <TextButton
                              disabled={loading}
                              onClick={() => {
                                const answer = confirm(
                                  'Wollen Sie die Newsletter für diesen Benutzer reaktivieren?\nDer Benutzer wird eine E-Mail erhalten, um die Reaktivierung zu bestätigen.',
                                )
                                if (answer)
                                  mutate({ variables: { userId: user.id } })
                              }}
                            >
                              reaktivieren
                            </TextButton>
                            {loading && <InlineSpinner size={22} />}
                          </div>
                        )
                      }}
                    </Mutation>
                  )}
                </div>
                {hasNonEligibleSubscription &&
                  'Es können nur User mit aktiver Membership die Republik-Newsletter abonnieren.'}
                {subscriptions.map((subscription, index) => (
                  <UpdateSubscription
                    t={t}
                    key={`${subscription.name}-${index}-${subscription.subscribed}`}
                    user={user}
                    subscription={subscription}
                  />
                ))}
              </Section>
            )
          }}
        />
      )
    }}
  </Query>
)

export default withT(NewsletterSubscriptions)
