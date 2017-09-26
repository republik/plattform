import React, { Component } from 'react'
import { gql, graphql } from 'react-apollo'
import { css } from 'glamor'
import { Label } from '@project-r/styleguide'
import { compose } from 'redux'
import { swissTime } from '../../lib/utils/format'
import Loader from '../../components/Loader'
import withT from '../../lib/withT'

const timeFormat = swissTime.format('%d. %B %Y, %H:%M Uhr')

const styles = {
  container: css({
    fontSize: '11px',
    padding: '0 0 5px 0'
  })
}

const getCommitInfo = gql`
  query test($repoId: ID!, $commitId: ID!) {
    repo(id: $repoId) {
      id
      commit(id: $commitId) {
        id
        date
        message
        author {
          name
        }
      }
    }
  }
`

class BaseCommit extends Component {
  render () {
    const { data: {loading, error, repo}, t } = this.props
    const commit = repo && repo.commit

    return (
      <Loader loading={loading} error={error} render={() => (
        <div {...styles.container}>
          {commit &&
            <div>
              <Label>{t('baseCommit/title')}</Label>
              <div{...styles.title}>
                {commit.message}
              </div>
              <div>
                {commit.author.name}
              </div>
              <div>
                {timeFormat(new Date(repo.commit.date))}
              </div>
            </div>}
        </div>
      )} />
    )
  }
}

export default compose(
  withT,
  graphql(getCommitInfo, {
    options: props => ({
      variables: {
        repoId: props.repoId,
        commitId: props.commitId
      }
    })
  })
)(BaseCommit)
