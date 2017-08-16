import React, { Component } from 'react'
import EditorNav from './EditorNav'
import { css } from 'glamor'

import 'glamor/reset'

import { fontFamilies } from '@project-r/styleguide'

css.global('html', { boxSizing: 'border-box' })
css.global('*, *:before, *:after', { boxSizing: 'inherit' })

css.global('body', {
  fontFamily: fontFamilies.sansSerifRegular
})

const styles = {
  container: css({
    display: 'flex',
    flexDirection: 'row'
  }),
  main: css({
    flex: 1,
    padding: '0 20px 0 180px'
  })
}

export default class EditorFrame extends Component {
  render () {
    const { children, repository, commit, view } = this.props

    return (
      <div {...styles.container}>
        <div {...styles.main}>
          <EditorNav view={view} repository={repository} commit={commit} />
          {children}
        </div>
      </div>
    )
  }
}
