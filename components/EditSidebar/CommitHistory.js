import React from 'react'
import { Link } from '../../lib/routes'
import { colors, linkRule } from '@project-r/styleguide'
import { css } from 'glamor'
import { swissTime } from '../../lib/utils/format'
import withT from '../../lib/withT'

const timeFormat = swissTime.format('%d. %B %Y, %H:%M Uhr')

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

const CommitHistory = ({ commits, repoId, maxItems, t }) => {
  const numItems = maxItems || 3
  const repoPath = repoId.split('/')
  if (commits.length) {
    return (
      <div {...styles.container}>
        <ul {...styles.commits}>
          {commits.slice(0, numItems).map(commit =>
            <li key={commit.id} {...styles.commit}>
              <Link
                route='repo/edit'
                params={{
                  repoId: repoPath,
                  commitId: commit.id
                }}
              >
                <a {...linkRule}>
                  {commit.message}
                </a>
              </Link>
              <span {...styles.date}>
                {commit.author.name}
              </span>
              <span {...styles.date}>
                {timeFormat(new Date(commit.date))}
              </span>
            </li>
          )}
        </ul>
        <Link
          route='repo/tree'
          params={{repoId: repoPath}}
        >
          <a {...linkRule}>{t('commitHistory/more')}</a>
        </Link>
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

export default withT(CommitHistory)
