import { Component } from 'react'
import Link from 'next/link'
import { colors, A, Interaction } from '@project-r/styleguide'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { swissTime } from '../../lib/utils/format'
import withT from '../../lib/withT'

const timeFormat = swissTime.format('%d. %B %Y, %H:%M Uhr')
const { P } = Interaction

const styles = {
  container: css({
    fontSize: '13px',
    marginBottom: '20px',
  }),
  commits: css({
    borderTop: `1px solid ${colors.divider}`,
    listStyleType: 'none',
    margin: '5px 0',
    padding: 0,
  }),
  commit: css({
    borderBottom: `1px solid ${colors.divider}`,
    padding: '5px 0',
    position: 'relative',
  }),
  date: css({
    display: 'block',
    fontSize: '11px',
  }),
}

class CommitHistory extends Component {
  render() {
    const { repoId, commitId, commits, maxItems, t } = this.props

    const numItems = maxItems || 3
    if (commits.length) {
      return (
        <div {...styles.container}>
          <ul {...styles.commits}>
            {commits.slice(0, numItems).map((commit) => (
              <li key={commit.id} {...styles.commit}>
                {commit.id !== commitId ? (
                  <Link
                    href={{
                      pathname: `/repo/${repoId}/edit`,
                      query: { commitId: commit.id },
                    }}
                    passHref
                    legacyBehavior
                  >
                    <A>{commit.message}</A>
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
          <Link href={`/repo/${repoId}/tree`} legacyBehavior>
            <A>{t('commitHistory/more')}</A>
          </Link>
        </div>
      )
    } else {
      return <P>{t('commitHistory/none')}</P>
    }
  }
}

export default compose(withT)(CommitHistory)
