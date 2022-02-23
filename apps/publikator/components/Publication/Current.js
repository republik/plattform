import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'

import LockIcon from 'react-icons/lib/md/lock'
import PublicIcon from 'react-icons/lib/md/public'

import {
  InlineSpinner,
  Interaction,
  Label,
  A,
  colors,
} from '@project-r/styleguide'

import withT from '../../lib/withT'
import { getName } from '../../lib/utils/name'
import { FRONTEND_BASE_URL } from '../../lib/settings'
import * as fragments from '../../lib/graphql/fragments'
import Loader from '../Loader'
import List, { Item, Highlight } from '../List'
import { swissTime } from '../../lib/utils/format'
import ErrorMessage from '../ErrorMessage'
import Derivatives from '../Derivatives'

const timeFormat = swissTime.format('%d. %B %Y, %H:%M Uhr')

export const unpublish = gql`
  mutation unpublish($repoId: ID!) {
    unpublish(repoId: $repoId)
  }
`

export const getRepoWithPublications = gql`
  query repoWithPublications($repoId: ID!) {
    repo(id: $repoId) {
      id
      latestPublications {
        name
        prepublication
        live
        scheduledAt
        updateMailchimp
        date
        author {
          name
          email
        }
        commit {
          id
          derivatives {
            ...SimpleDerivative
          }
        }
        document {
          id
          meta {
            path
          }
        }
      }
    }
  }

  ${fragments.SimpleDerivative}
`

class CurrentPublications extends Component {
  constructor(...args) {
    super(...args)

    this.state = {}
  }
  render() {
    const { t, data } = this.props
    const { loading, error, repo } = data
    const { unpublishing } = this.state

    return (
      <Loader
        loading={loading}
        error={error}
        height={300}
        render={() => {
          if (!repo.latestPublications.length) {
            return null
          }
          return (
            <div>
              <Interaction.H2>
                {t.pluralize('publication/current/title', {
                  count: repo.latestPublications.length,
                })}
              </Interaction.H2>
              <List>
                {repo.latestPublications.map((publication) => (
                  <Item key={publication.name}>
                    <div style={{ float: 'right' }}>
                      <Derivatives commit={publication.commit} />
                      {publication.live && publication.document?.meta?.path && (
                        <a
                          href={`${FRONTEND_BASE_URL}${publication.document.meta.path}`}
                        >
                          {publication.prepublication && (
                            <LockIcon color={colors.primary} />
                          )}
                          {!publication.prepublication && (
                            <PublicIcon color={colors.primary} />
                          )}
                        </a>
                      )}
                    </div>
                    {publication.prepublication &&
                      t('publication/current/prepublication')}{' '}
                    <Highlight>{publication.name}</Highlight>{' '}
                    {!publication.live &&
                      publication.scheduledAt &&
                      t('publication/current/scheduledAt', {
                        dateTime: timeFormat(new Date(publication.scheduledAt)),
                      })}
                    <br />
                    <Label>
                      {getName(publication.author)}
                      <br />
                      {timeFormat(new Date(publication.date))}
                    </Label>
                  </Item>
                ))}
              </List>
              {!!this.state.error && <ErrorMessage error={this.state.error} />}
              {unpublishing ? (
                <InlineSpinner size={25} />
              ) : (
                <A
                  href='#'
                  onClick={(e) => {
                    e.preventDefault()
                    if (
                      window.confirm(
                        t('publication/current/unpublish/confirmAll'),
                      )
                    ) {
                      this.setState({ unpublishing: true })
                      this.props
                        .unpublish()
                        .then(() => {
                          this.setState({ unpublishing: false })
                        })
                        .catch((error) => {
                          this.setState(() => ({
                            unpublishing: false,
                            error: error,
                          }))
                        })
                    }
                  }}
                >
                  {t('publication/current/unpublish/action')}
                </A>
              )}
            </div>
          )
        }}
      />
    )
  }
}

export default compose(
  withT,
  graphql(unpublish, {
    props: ({ mutate, ownProps }) => ({
      unpublish: () =>
        mutate({
          variables: {
            repoId: ownProps.repoId,
          },
          refetchQueries: [
            {
              query: getRepoWithPublications,
              variables: {
                repoId: ownProps.repoId,
              },
            },
          ],
        }),
    }),
  }),
  graphql(getRepoWithPublications),
)(CurrentPublications)
