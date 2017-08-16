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
    cursor: 'pointer',
    display: 'inline-block',
    padding: '5px 20px',
    textAlign: 'center',
    ':hover': {
      backgroundColor: colors.secondaryBg
    },
    ':last-child': {
      borderRightWidth: '1px'
    }
  }),
  tabSelected: css({
    backgroundColor: colors.primaryBg
  }),
  navLink: css({
    color: '#000',
    opacity: 0.8,
    textDecoration: 'none',
    ':hover': {
      backgroundColor: colors.secondaryBg,
      opacity: 1
    }
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
      <div>
        {Object.keys(menu).map((keyName, keyIndex) =>
          <span
            key={keyName}
            {...(this.props.view === keyName
              ? merge(styles.tab, styles.tabSelected)
              : styles.tab)}
          >
            <Link
              route={
                menu[keyName].basePath +
                repository +
                '/' +
                (commit ? commit + '/' : '')
              }
            >
              <a {...styles.navLink}>
                {menu[keyName].label}
              </a>
            </Link>
          </span>
        )}
      </div>
    )
  }
}
