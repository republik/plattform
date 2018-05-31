import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import { compose } from 'redux'

import withT from '../../lib/withT'
import { getRepoWithPublications } from '../../lib/graphql/queries'
import { unpublish } from '../../lib/graphql/mutations'
import { getName } from '../../lib/utils/name'
import Loader from '../Loader'
import List, { Item, Highlight } from '../List'
import {
  InlineSpinner, Interaction, Label, A
} from '@project-r/styleguide'
import { swissTime } from '../../lib/utils/format'
import ErrorMessage from '../ErrorMessage'

import { query as treeQuery } from '../../pages/repo/tree'

const timeFormat = swissTime.format('%d. %B %Y, %H:%M Uhr')

class CurrentPublications extends Component {
  constructor (...args) {
    super(...args)

    this.state = {}
  }
  render () {
    const { t, data } = this.props
    const { loading, error, repo } = data
    const { unpublishing } = this.state

    return (
      <Loader loading={loading} error={error} height={300} render={() => {
        if (!repo.latestPublications.length) {
          return null
        }
        return (
          <div>
            <Interaction.H2>
              {t.pluralize('publication/current/title', {
                count: repo.latestPublications.length
              })}
            </Interaction.H2>
            <List>
              {repo.latestPublications.map(publication => (
                <Item key={publication.name}>
                  {publication.prepublication && t('publication/current/prepublication')}
                  {' '}
                  <Highlight>{publication.name}</Highlight>
                  {' '}
                  {!publication.live && publication.scheduledAt && t('publication/current/scheduledAt', {
                    dateTime: timeFormat(new Date(publication.scheduledAt))
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
            {unpublishing
              ? <InlineSpinner size={25} />
              : <A href='#' onClick={e => {
                e.preventDefault()
                if (window.confirm(t('publication/current/unpublish/confirmAll'))) {
                  this.setState({unpublishing: true})
                  this.props.unpublish().then(() => {
                    this.setState({unpublishing: false})
                  }).catch((error) => {
                    this.setState(() => ({
                      unpublishing: false,
                      error: error
                    }))
                  })
                  this.props.unpublish()
                }
              }}>
                {t('publication/current/unpublish/action')}
              </A>}
          </div>
        )
      }} />
    )
  }
}

export default compose(
  withT,
  graphql(unpublish, {
    props: ({mutate, ownProps}) => ({
      unpublish: () => mutate({
        variables: {
          repoId: ownProps.repoId
        },
        refetchQueries: [
          {
            getRepoWithPublications,
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
  graphql(getRepoWithPublications)
)(CurrentPublications)
