import React, { Component } from 'react'
import { gql, graphql } from 'react-apollo'
import { Link } from '../../lib/routes'
import { colors, linkRule, Interaction } from '@project-r/styleguide'
import { css } from 'glamor'
import { compose } from 'redux'
import { swissTime } from '../../lib/utils/format'
import Loader from '../../components/Loader'
import withT from '../../lib/withT'

const timeFormat = swissTime.format('%d. %B %Y, %H:%M Uhr')
const { P } = Interaction

const styles = {
  container: css({
    fontSize: '13px',
    marginBottom: '20px'
  }),
  commits: css({
    borderTop: `1px solid ${colors.divider}`,
    listStyleType: 'none',
    margin: '5px 0',
    padding: 0
  }),
  commit: css({
    borderBottom: `1px solid ${colors.divider}`,
    padding: '5px 0',
    position: 'relative'
  }),
  date: css({
    display: 'block',
    fontSize: '11px'
  })
}

const getCommits = gql`
  query getCommits($repoId: ID!) {
    repo(id: $repoId) {
      id
      commits {
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

class CommitHistory extends Component {
  render () {
    const { data: { loading, error, repo }, commitId, maxItems, t } = this.props

    return (
      <Loader
        loading={loading}
        error={error}
        render={() => {
          const numItems = maxItems || 3
          const repoPath = repo.id.split('/')
          if (repo.commits.length) {
            return (
              <div {...styles.container}>
                <ul {...styles.commits}>
                  {repo.commits.slice(0, numItems).map(commit => (
                    <li key={commit.id} {...styles.commit}>
                      {commit.id !== commitId ? (
                        <Link
                          route='repo/edit'
                          params={{
                            repoId: repoPath,
                            commitId: commit.id
                          }}
                        >
                          <a {...linkRule}>{commit.message}</a>
                        </Link>
                      ) : (
                        <span>{commit.message}</span>
                      )}
                      <span {...styles.date}>{commit.author.name}</span>
                      <span {...styles.date}>
                        {timeFormat(new Date(commit.date))}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link route='repo/tree' params={{ repoId: repoPath }}>
                  <a {...linkRule}>{t('commitHistory/more')}</a>
                </Link>
              </div>
            )
          } else {
            return <P>{t('commitHistory/none')}</P>
          }
        }}
      />
    )
  }
}

export default compose(
  withT,
  graphql(getCommits, {
    options: props => ({
      variables: {
        repoId: props.repoId
      }
    })
  })
)(CommitHistory)
