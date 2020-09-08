import React from 'react'
import { css } from 'glamor'
import { mUp } from '../TeaserFront/mediaQueries'
import { sansSerifMedium14, sansSerifMedium20 } from '../Typography/styles'
import { FolderIcon } from '../Icons'

const styles = {
  tag: css({
    display: 'inline-block',
    ...sansSerifMedium14,
    margin: '0 0 18px 0',
    [mUp]: {
      ...sansSerifMedium20,
      margin: '0 0 28px 0'
    }
  }),
  icon: css({
    marginRight: '8px',
    verticalAlign: 'middle'
  })
}

const Tag = ({ children, attributes }) => {
  return (
    <div {...attributes} {...styles.tag}>
      <FolderIcon {...styles.icon} size={24} />
      {children}
    </div>
  )
}

export default Tag
