import React, { Component } from 'react'
import { Link } from '../../server/routes'
import { css, merge } from 'glamor'
import { colors } from '@project-r/styleguide'

const styles = {
  tab: css({
    backgroundColor: '#f0f0f0',
    border: `1px solid ${colors.divider}`,
    borderRightWidth: 0,
    bottom: 0,
    color: '#000',
    cursor: 'pointer',
    display: 'inline-block',
    padding: '10px 20px',
    textAlign: 'center',
    textDecoration: 'none',
    ':hover': {
      backgroundColor: colors.secondaryBg
    },
    ':last-child': {
      borderRightWidth: '1px'
    }
  }),
  tabSelected: css({
    backgroundColor: colors.primaryBg
  })
}

const menu = {
  edit: {
    label: 'Edit',
    basePath: '/stories/edit/'
  },
  meta: {
    label: 'Meta',
    basePath: '/stories/meta/'
  },
  tree: {
    label: 'Tree',
    basePath: '/stories/tree/'
  },
  publish: {
    label: 'Publish',
    basePath: '/stories/publish/'
  }
}

export default class EditorNav extends Component {
  render () {
    const { repository, commit } = this.props
    return (
      <div style={{ display: 'inline-block' }}>
        {Object.keys(menu).map((keyName, keyIndex) =>
          <Link
            key={keyName}
            route={
              menu[keyName].basePath +
              repository +
              '/' +
              (commit ? commit + '/' : '')
            }
          >
            <a
              {...(this.props.view === keyName
                ? merge(styles.tab, styles.tabSelected)
                : styles.tab)}
            >
              {menu[keyName].label}
            </a>
          </Link>
        )}
      </div>
    )
  }
}
