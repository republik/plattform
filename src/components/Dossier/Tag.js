import React from 'react'
import { css } from 'glamor'
import { mUp } from '../TeaserFront/mediaQueries'
import { sansSerifMedium16, sansSerifMedium20 } from '../Typography/styles'
import FolderOpen from 'react-icons/lib/fa/folder-open'

const styles = {
  tag: css({
    display: 'inline-block',
    ...sansSerifMedium16,
    margin: '0 0 18px 0',
    [mUp]: {
      ...sansSerifMedium20,
      margin: '0 0 28px 0'
    }
  }),
  icon: css({
    fontSize: '24px',
    marginRight: '8px'
  })
}

const DefaultLink = ({ children, slug }) => children

const Tag = ({ t, slug, Link = DefaultLink }) => {
  return (
    <Link slug={slug}>
      <a {...styles.tag}>
        <FolderOpen {...styles.icon} />
        {t('styleguide/Dossier/label')}
      </a>
    </Link>
  )
}

export default Tag
