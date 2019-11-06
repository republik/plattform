import React, { Component } from 'react'
import { css } from 'glamor'
import { Label, linkRule } from '@project-r/styleguide'
import { descending } from 'd3-array'
import { compose } from 'react-apollo'
import { Link } from '../../lib/routes'
import { swissTime } from '../../lib/utils/format'
import withT from '../../lib/withT'

const timeFormat = swissTime.format('%d. %B %Y, %H:%M Uhr')

const styles = {
  container: css({
    fontSize: '11px',
    padding: '0 0 5px 0'
  }),
  commitsBehind: css({
    display: 'block'
  })
}

class BaseCommit extends Component {
  render() {
    const { commit, commits, repoId, t } = this.props

    const commitsBehind = [...commits]
      .sort(function(a, b) {
        return descending(new Date(a.date), new Date(b.date))
      })
      .map(c => c.id)
      .indexOf(commit.id)

    return (
      <div {...styles.container}>
        {commit && (
          <div>
            <Label {...styles.commitsBehind}>
              <Link route='repo/tree' params={{ repoId: repoId.split('/') }}>
                <a {...linkRule}>
                  {commitsBehind !== null && (
                    <span>
                      {t.pluralize('baseCommit/commitsBehind', {
                        count: commitsBehind
                      })}
                    </span>
                  )}
                </a>
              </Link>
            </Label>
            <Label>{t('baseCommit/title')}</Label>
            <div {...styles.title}>{commit.message}</div>
            <div>{commit.author.name}</div>
            <div>{timeFormat(new Date(commit.date))}</div>
          </div>
        )}
      </div>
    )
  }
}

export default compose(withT)(BaseCommit)
