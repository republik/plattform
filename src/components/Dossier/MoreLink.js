import React from 'react'
import { css } from 'glamor'
import { Editorial } from '../Typography'

const styles = {
  link: css({
    display: 'block',
    marginTop: '40px',
    textAlign: 'center'
  })
}

const DefaultLink = ({ children, slug }) => children

const MoreLink = ({ t, count, slug, Link = DefaultLink }) => {
  return (
    <Link slug={slug}>
      <Editorial.A {...styles.link}>
        {t.pluralize('styleguide/Dossier/showmore', { count: count })}
      </Editorial.A>
    </Link>
  )
}

export default MoreLink
