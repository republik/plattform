import React from 'react'
import { Link } from '../../lib/routes'
import { css } from 'glamor'
import { swissTime } from '../../lib/utils/format'

import { colors } from '@project-r/styleguide'

const timeFormat = swissTime.format('%d. %B %Y, %H:%M Uhr')

const styles = {
  commits: css({
    borderBottom: `1px dotted ${colors.divider}`,
    borderTop: `1px dotted ${colors.divider}`,
    listStyleType: 'none',
    margin: '5px 0 20px',
    maxHeight: '300px',
    overflow: 'scroll',
    padding: 0
  }),
  commit: css({
    borderBottom: `1px solid ${colors.divider}`,
    fontSize: '13px',
    padding: '5px 0',
    position: 'relative'
  }),
  date: css({
    display: 'block',
    fontSize: '11px'
  })
}

const CommitHistory = ({ commits, repository }) => {
  if (commits.length) {
    return (
      <div>
        <ul {...styles.commits}>
          {commits.map(commit =>
            <li key={commit.id} {...styles.commit}>
              <Link
                route='editor/edit'
                params={Object.assign(
                  {},
                  {
                    repository: repository,
                    commit: commit.id
                  }
                )}
              >
                <a>
                  {commit.message}
                </a>
              </Link>
              <span {...styles.date}>
                {commit.author.email}
              </span>
              <span {...styles.date}>
                {timeFormat(new Date(commit.date))}
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

export default CommitHistory
