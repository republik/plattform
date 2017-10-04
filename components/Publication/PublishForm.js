import React, { Component } from 'react'
import { gql, graphql } from 'react-apollo'
import { compose } from 'redux'
import { css } from 'glamor'

import { InlineSpinner } from '../Spinner'
import Loader from '../Loader'
import ErrorMessage from '../ErrorMessage'

import withT from '../../lib/withT'
import { Link, Router } from '../../lib/routes'
import { swissTime } from '../../lib/utils/format'
import {
  Interaction,
  Label,
  linkRule,
  Button,
  Field,
  Checkbox,
  colors
} from '@project-r/styleguide'

import MaskedInput from 'react-maskedinput'

import { query as treeQuery } from '../../pages/repo/tree'
import { query as publicationQuery } from './Current'

const timeFormat = swissTime.format('%d. %B %Y, %H:%M Uhr')

const query = gql`
  query repoWithCommit($repoId: ID!, $commitId: ID!) {
    repo(id: $repoId) {
      id
      commit(id: $commitId) {
        id
        message
        date
        author {
          email
          name
        }
        document {
          content
          meta {
            slug
            emailSubject
            publishDate
          }
        }
      }
    }
  }
`

const styles = {
  mask: css({
    '::placeholder': {
      color: 'transparent'
    },
    ':focus': {
      '::placeholder': {
        color: '#ccc'
      }
    }
  })
}

const scheduledAtFormat = '%d.%m.%Y %H:%M'
const scheduledAtParser = swissTime.parse(scheduledAtFormat)
const scheduledAtFormater = swissTime.format(scheduledAtFormat)

const mutation = gql`
mutation publish(
  $repoId: ID!,
  $commitId: ID!,
  $prepublication: Boolean!,
  $scheduledAt: DateTime,
  $updateMailchimp: Boolean!
) {
  publish(
    repoId: $repoId,
    commitId: $commitId,
    prepublication: $prepublication,
    scheduledAt: $scheduledAt,
    updateMailchimp: $updateMailchimp) {
    name
  }
}
`

class PublishForm extends Component {
  constructor (...args) {
    super(...args)

    const nextMorning = new Date()
    if (nextMorning.getHours() > 5) {
      nextMorning.setDate(nextMorning.getDate() + 1)
    }
    nextMorning.setHours(7)
    nextMorning.setMinutes(0)

    this.state = {
      prepublication: true,
      scheduled: false,
      scheduledAt: scheduledAtFormater(nextMorning),
      updateMailchimp: false
    }
  }
  render () {
    const { t, data, repoId } = this.props
    const {
      prepublication, updateMailchimp, scheduled, scheduledAt,
      publishing
    } = this.state
    const { loading, error, repo } = data

    const scheduledAtDate = scheduledAtParser(scheduledAt)
    const scheduledAtError = scheduledAtDate === null && t('publish/label/scheduledAt')

    return (
      <Loader loading={loading} error={error} render={() => {
        const { commit, commit: { document: { meta } } } = repo

        const errors = [
          !meta.slug && t('publish/validation/slug/empty'),
          !meta.publishDate && t('publish/validation/publishDate/empty'),
          (updateMailchimp && !meta.emailSubject) && t('publish/validation/emailSubject/empty')
        ].filter(Boolean)
        const hasErrors = errors.length > 0

        return (
          <div>
            <Label>{t('publish/commit/selected')}</Label>
            <Interaction.P>
              {commit.message}
            </Interaction.P>
            <Label>
              {commit.author.name}<br />
              {timeFormat(new Date(commit.date))}
            </Label>
            <Interaction.P>
              <Label>
                <Link
                  route='repo/tree'
                  params={{
                    repoId: repoId.split('/')
                  }}
                >
                  <a {...linkRule}>
                    {t('publish/commit/change')}
                  </a>
                </Link>
              </Label>
            </Interaction.P>

            <br /><br />

            {hasErrors && (
              <Interaction.P style={{color: colors.error}}>
                {t('publish/validation/hasErrors')}
                <ul>
                  {errors.map((error, i) => (
                    <li key={i}>
                      {error}
                    </li>
                  ))}
                </ul>
                <br /><br />
              </Interaction.P>
            )}

            <Checkbox checked={prepublication} onChange={(_, value) => {
              this.setState({
                prepublication: value
              })
            }}>
              {t('publish/label/prepublication')}
            </Checkbox>
            <br />
            <br />
            <Checkbox checked={updateMailchimp} onChange={(_, value) => {
              this.setState({
                updateMailchimp: value
              })
            }}>
              {t('publish/label/updateMailchimp')}
            </Checkbox>
            <br />
            <br />
            <Checkbox checked={scheduled} onChange={(_, value) => {
              this.setState({
                scheduled: value
              })
            }}>
              {t('publish/label/scheduled')}
            </Checkbox>

            {scheduled && <Field
              renderInput={(inputProps) => (
                <MaskedInput
                  {...inputProps}
                  {...styles.mask}
                  placeholderChar={'_'}
                  mask={'11.11.1111 11:11'} />
              )}
              label={t('publish/label/scheduledAt')}
              value={scheduledAt}
              error={scheduledAtError}
              onChange={(_, value) => {
                this.setState({
                  scheduledAt: value
                })
              }} />}

            <br /><br /><br />

            {publishing ? (
              <div style={{textAlign: 'center'}}>
                <InlineSpinner />
              </div>
            ) : (
              <div>
                {!!this.state.error && (
                  <ErrorMessage error={this.state.error} />
                )}
                <Button block primary disabled={hasErrors} onClick={() => {
                  if (scheduled && scheduledAtError) {
                    return
                  }
                  this.setState(() => ({publishing: true}))
                  this.props.publish({
                    repoId,
                    commitId: commit.id,
                    prepublication,
                    updateMailchimp,
                    scheduledAt: scheduled ? scheduledAtDate : undefined
                  }).then(() => {
                    Router.pushRoute('repo/tree', {
                      repoId: repoId.split('/')
                    })
                  }).catch((error) => {
                    this.setState(() => ({
                      publishing: false,
                      error: error
                    }))
                  })
                }}>
                  {t('publish/trigger')}
                </Button>
              </div>
            )}
          </div>
        )
      }} />
    )
  }
}

export default compose(
  withT,
  graphql(mutation, {
    props: ({mutate, ownProps}) => ({
      publish: variables => mutate({
        variables,
        refetchQueries: [
          {
            query: publicationQuery,
            variables: {
              repoId: ownProps.repoId
            }
          },
          {
            query: treeQuery,
            variables: {
              repoId: ownProps.repoId
            }
          }
        ]
      })
    })
  }),
  graphql(query)
)(PublishForm)
