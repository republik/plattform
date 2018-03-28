import React, { Component, Fragment } from 'react'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import { css } from 'glamor'
import withT from '../../../lib/withT'
import ErrorMessage from '../../ErrorMessage'

import {
  InlineSpinner,
  Interaction,
  Checkbox,
  colors
} from '@project-r/styleguide'

const { P } = Interaction

const styles = {
  headline: css({
    margin: '80px 0 30px 0'
  }),
  spinnerWrapper: css({
    display: 'inline-block',
    height: 0,
    marginLeft: 15,
    verticalAlign: 'middle',
    '& > span': {
      display: 'inline'
    }
  }),
  box: css({
    paddingTop: 30,
    paddingBottom: 30,
    backgroundColor: colors.primaryBg
  })
}

const Box = props => <div {...props} {...styles.box} />

class NewsletterSubscriptions extends Component {
  constructor(props) {
    super(props)
    this.state = {
      mutating: {}
    }
  }

  render() {
    const {
      t,
      user,
      loading,
      error,
      updateNewsletterSubscription
    } = this.props

    if (error) {
      return <ErrorMessage error={error} />
    } else if (loading) {
      return <div>Loading ...</div>
    }
    const {
      subscriptions,
      status
    } = user.newsletterSettings
    const { mutating } = this.state
    const hasNonEligibleSubscription = subscriptions.some(
      newsletter => !newsletter.isEligible
    )
    return (
      <Fragment>
        <Interaction.H3>Newsletter</Interaction.H3>
        {hasNonEligibleSubscription && (
          <Box style={{ margin: '10px 0', padding: 15 }}>
            <P>
              {t(
                'account/newsletterSubscriptions/noMembership'
              )}
            </P>
          </Box>
        )}
        {subscriptions.map(
          ({ name, subscribed, isEligible }, i) => (
            <p key={`${name}-${i}`}>
              <Checkbox
                checked={subscribed}
                disabled={
                  (!isEligible && !subscribed) ||
                  mutating[name]
                }
                onChange={(_, checked) => {
                  this.setState(state => ({
                    mutating: {
                      ...state.mutating,
                      [name]: true
                    }
                  }))
                  const finish = () => {
                    this.setState(state => ({
                      mutating: {
                        ...state.mutating,
                        [name]: false
                      }
                    }))
                  }
                  updateNewsletterSubscription({
                    name,
                    subscribed: checked,
                    status
                  }).then(finish)
                }}
              >
                {t(
                  `account/newsletterSubscriptions/${name}/label`
                )}
                {mutating[name] && (
                  <span {...styles.spinnerWrapper}>
                    <InlineSpinner size={24} />
                  </span>
                )}
              </Checkbox>
            </p>
          )
        )}
      </Fragment>
    )
  }
}

const mutation = gql`
  mutation updateNewsletterSubscription(
    $name: NewsletterName!
    $subscribed: Boolean!
    $status: String!
  ) {
    updateNewsletterSubscription(
      name: $name
      subscribed: $subscribed
      status: $status
    ) {
      id
      name
      subscribed
      isEligible
    }
  }
`

const query = gql`
  query newsletterSettings($id: String) {
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

export default compose(
  graphql(mutation, {
    props: ({ mutate }) => ({
      updateNewsletterSubscription: ({
        name,
        subscribed,
        status
      }) =>
        mutate({
          variables: {
            name,
            subscribed,
            status
          }
        })
    })
  }),
  graphql(query, {
    props: ({ data }) => ({
      loading: data.loading || !data.user,
      error: data.error,
      user: data.loading ? undefined : data.user
    }),
    options: ({ user }) => {
      return {
        variables: {
          id: user.id
        }
      }
    }
  }),
  withT
)(NewsletterSubscriptions)
