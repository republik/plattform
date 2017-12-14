import React from 'react'
import Router from 'next/router'
import {
  BrandMark,
  Interaction
} from '@project-r/styleguide'
import { css } from 'glamor'
import withT from '../../lib/withT'

const styles = {
  nav: css({
    paddingTop: 15,
    paddingLeft: 15,
    verticalAlign: 'top',
    display: 'inline-block'
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
  })
}

export const Nav = ({ t, url, children }) => {
  const { repository } = url.query
  return (
    <div {...styles.nav}>
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
      <Interaction.H2 style={{display: 'inline-block'}}>{t('app/name')}</Interaction.H2>
      {!!repository &&
      <span {...styles.repoName}>
        {repository}
      </span>
    }
      <br />
      {children}
    </div>
  )
}

export default withT(Nav)
