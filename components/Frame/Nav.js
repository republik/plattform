import React from 'react'
import { compose } from 'react-apollo'
import Router, { withRouter } from 'next/router'
import { BrandMark, Interaction, mediaQueries } from '@project-r/styleguide'
import { css } from 'glamor'
import withT from '../../lib/withT'

const styles = {
  nav: css({
    paddingTop: 15,
    paddingLeft: 15,
    verticalAlign: 'top',
    display: 'inline-block',
    [mediaQueries.onlyS]: {
      fontSize: 14
    }
  }),
  appLink: css({
    color: 'inherit',
    textDecoration: 'none'
  }),
  logo: css({
    display: 'inline-block',
    width: 50,
    float: 'left',
    marginRight: 20,
    verticalAlign: 'top',
    lineHeight: 0
  }),
  logoWithChildren: css({
    [mediaQueries.onlyS]: {
      display: 'none'
    }
  }),
  repoName: css({
    marginLeft: 8,
    display: 'inline-block',
    fontSize: 22
  })
}

export const Nav = ({ t, router, children }) => {
  const onLogoClick = e => {
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
    if (router.pathname === '/') {
      window.scrollTo(0, 0)
    } else {
      Router.push('/').then(() => window.scrollTo(0, 0))
    }
  }

  return (
    <div {...styles.nav}>
      <a
        {...styles.logo}
        {...(!!children && styles.logoWithChildren)}
        href='/'
        onClick={onLogoClick}
      >
        <BrandMark />
      </a>
      <Interaction.H2 style={{ display: 'inline-block' }}>
        <a href='/' onClick={onLogoClick} {...styles.appLink}>
          {t('app/name')}
        </a>
      </Interaction.H2>
      <br />
      {children}
    </div>
  )
}

export default compose(
  withT,
  withRouter
)(Nav)
