import React, { Component } from 'react'
import { css } from 'glamor'
import Router from 'next/router'
import { compose } from 'redux'

import withMe from '../../lib/withMe'

import {
  BrandMark,
  Interaction,
  colors
} from '@project-r/styleguide'

import LoadingBar from './LoadingBar'
import { HEADER_HEIGHT } from './constants'

const cleanName = string => (
  string.split('@')[0]
    .replace(/\s*\.\s*/, ' ')
    .split(' ')
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join(' ')
)

const styles = {
  bar: css({
    zIndex: 20, // goes over footer
    position: 'fixed',
    '@media print': {
      position: 'absolute'
    },
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    height: HEADER_HEIGHT,
    borderBottom: `1px solid ${colors.divider}`,
    whiteSpace: 'nowrap',
    overflow: 'auto'
  }),
  left: css({
    paddingTop: 15,
    paddingLeft: 15,
    display: 'inline-block',
    minWidth: '75%',
    verticalAlign: 'top'
  }),
  right: css({
    display: 'inline-block',
    minWidth: '25%',
    textAlign: 'right'
  }),
  logo: css({
    width: 50,
    display: 'inline-block',
    float: 'left',
    marginRight: 20,
    verticalAlign: 'top',
    lineHeight: 0
  }),
  repoName: css({
    marginLeft: 8,
    display: 'inline-block',
    fontSize: 22
  }),
  portrait: css({
    height: HEADER_HEIGHT,
    marginLeft: 5,
    verticalAlign: 'top'
  }),
  initials: css({
    display: 'inline-block',
    marginLeft: 5,
    verticalAlign: 'top',
    textAlign: 'center',
    backgroundColor: '#ccc',
    color: '#000',
    textTransform: 'uppercase',
    width: HEADER_HEIGHT,
    height: HEADER_HEIGHT,
    paddingTop: 28,
    fontSize: 20
  })
}

class Header extends Component {
  constructor (props) {
    super(props)

    this.state = {
    }
  }
  render () {
    const { url, me, children } = this.props

    const { repository } = url.query

    const barStyle = styles.bar

    return (
      <div>
        <div {...barStyle}>
          <div {...styles.left}>
            <a
              {...styles.logo}
              href='/'
              onClick={e => {
                if (
                  e.currentTarget.nodeName === 'A' &&
                  (e.metaKey ||
                    e.ctrlKey ||
                    e.shiftKey ||
                    (e.nativeEvent && e.nativeEvent.which === 2))
                ) {
                  // ignore click for new tab / new window behavior
                  return
                }
                e.preventDefault()
                if (url.pathname === '/') {
                  window.scrollTo(0, 0)
                } else {
                  Router.push('/').then(() => window.scrollTo(0, 0))
                }
              }}
            >
              <BrandMark />
            </a>
            <Interaction.H2 style={{display: 'inline-block'}}>Editor</Interaction.H2>
            {!!repository &&
              <span {...styles.repoName}>
                {repository}
              </span>
            }
            <br />
            {children}
          </div>
          <div {...styles.right}>
            <a
              href='/'
              onClick={e => {
                e.preventDefault()
              }}
            >
              {me.portrait
                ? <img src={me.portrait.url} {...styles.portrait} />
                : (
                  <span {...styles.initials}>
                    {cleanName(me.name.trim() || me.email)
                      .split(' ')
                      .map(p => p[0])
                      .join('')}
                  </span>
                  )
              }
            </a>
          </div>
        </div>
        <LoadingBar />
      </div>
    )
  }
}

export default compose(
  withMe
)(Header)
