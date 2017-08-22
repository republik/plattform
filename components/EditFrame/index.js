import React, { Component } from 'react'
import Nav from './Nav'
import { css, merge } from 'glamor'

import 'glamor/reset'

import { fontFamilies } from '@project-r/styleguide'

css.global('html', { boxSizing: 'border-box' })
css.global('*, *:before, *:after', { boxSizing: 'inherit' })

css.global('body', {
  fontFamily: fontFamilies.sansSerifRegular
})

const styles = {
  nav: css({
    display: 'inline-block',
    marginBottom: '20px',
    paddingLeft: '180px'
  }),
  main: css({
    flex: 1,
    paddingLeft: 0
  }),
  // TODO: This is just a simple hook for adjusting the left padding of the
  // main section for non-edit views for now.
  spaceLeft: css({
    paddingLeft: '180px'
  })
}

export default class EditorFrame extends Component {
  render () {
    const { children, repository, commit, view, spaceLeft } = this.props

    return (
      <div>
        <nav {...styles.nav}>
          <Nav view={view} repository={repository} commit={commit} />
        </nav>
        <div
          {...(spaceLeft ? merge(styles.main, styles.spaceLeft) : styles.main)}
        >
          {children}
        </div>
      </div>
    )
  }
}
