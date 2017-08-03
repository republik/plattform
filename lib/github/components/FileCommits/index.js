import { Link } from '../../../../server/routes'
import { gql, graphql } from 'react-apollo'
import { css } from 'glamor'
import { swissTime } from '../../../utils/format'

import { colors } from '@project-r/styleguide'

const timeFormat = swissTime.format('%d. %B %Y, %H:%M Uhr')

const styles = {
  commits: css({
    listStyleType: 'none',
    margin: 0,
    maxHeight: '300px',
    overflow: 'scroll',
    padding: 0
  }),
  commit: css({
    backgroundColor: colors.secondaryBg,
    borderBottom: `1px solid ${colors.divider}`,
    fontSize: '13px',
    padding: '5px',
    position: 'relative'
  }),
  date: css({
    display: 'block',
    fontSize: '11px'
  })
}

const query = gql`
  query tree($login: String!, $repository: String!, $filename: String!) {
    repository(owner: $login, name: $repository) {
      name
      owner {
        id
        login
      }
      refs(refPrefix: "refs/heads/", first: 100) {
        nodes {
          name
          target {
            ... on Commit {
              oid
              history(first: 30, path: $filename) {
                nodes {
                  author {
                    email
                    name
                  }
                  committedDate
                  oid
                  messageHeadline
                  messageBody
                }
              }
            }
          }
        }
      }
    }
  }
`

const FileCommits = ({ data: { loading, error, repository }, path }) => {
  if (loading) {
    return <div>Loading</div>
  }

  let branches
  let allCommits = []

  try {
    branches = repository.refs.nodes
    let oids = {}
    for (let i = 0; i < branches.length; i++) {
      let commits = branches[i].target.history.nodes
      if (commits.length) {
        allCommits.push(...commits)
      }
    }
    allCommits = allCommits
      .filter(function (item) {
        let val = item.oid
        var exists = oids[val]
        oids[val] = true
        return !exists
      })
      .sort(function (a, b) {
        return new Date(b.committedDate) - new Date(a.committedDate)
      })
  } catch (e) {}

  // Remove branch part from path.
  let filepath = path.split('/').slice(1).join('/')

  if (allCommits.length) {
    return (
      <div>
        <ul {...styles.commits}>
          {allCommits.map(commit =>
            <li
              key={commit.oid}
              {...styles.commit}
              style={{ backgroundColor: commit.color }}
            >
              <Link
                route='github'
                params={Object.assign(
                  {},
                  {
                    login: repository.owner.login,
                    repository: repository.name,
                    view: 'edit',
                    // TODO: The slash currently gets URL escaped, fix.
                    path: `${commit.oid}/${filepath}`
                  }
                )}
              >
                <a>
                  {commit.messageHeadline}
                </a>
              </Link>
              <span {...styles.date}>
                {commit.author.name}
              </span>
              <span {...styles.date}>
                {timeFormat(new Date(commit.committedDate))}
              </span>
            </li>
          )}
        </ul>
      </div>
    )
  } else {
    return (
      <div>
        <i>No commits</i>
      </div>
    )
  }
}

export default graphql(query, {
  options: ({ login, repository, path }) => ({
    variables: {
      login,
      repository,
      filename: path.split('/').slice(1).join('/')
    }
  })
})(FileCommits)
