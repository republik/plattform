import React, { Component } from 'react'
import { css } from 'glamor'
import { colors } from '@project-r/styleguide'
import { HEADER_HEIGHT, ZINDEX_SIDEBAR } from '../Frame/constants'

const styles = {
  container: css({
    position: 'fixed',
    top: HEADER_HEIGHT,
    right: 0,
    bottom: 0,
    overflow: 'auto',
    backgroundColor: '#fff',
    borderLeft: `1px solid ${colors.divider}`,
    opacity: 1,
    padding: 10,
    zIndex: ZINDEX_SIDEBAR
  })
}

export default class EditSidebar extends Component {
  render () {
    const { children, width = 200 } = this.props
    return (
      <div {...styles.container} style={{width}}>
        {children}
      </div>
    )
  }
}
