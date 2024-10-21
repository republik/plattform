import React from 'react'
import { css } from 'glamor'
import { mUp } from '../TeaserFront/mediaQueries'
import { sansSerifMedium14, sansSerifMedium20 } from '../Typography/styles'
import { IconFolder } from '@republik/icons'

const styles = {
  tag: css({
    display: 'inline-block',
    ...sansSerifMedium14,
    margin: '0 0 18px 0',
    [mUp]: {
      ...sansSerifMedium20,
      margin: '0 0 28px 0',
    },
  }),
  icon: css({
    marginRight: '8px',
  }),
}

type TagProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'div'>
}

const Tag = ({ children, attributes }: TagProps) => {
  return (
    <div {...attributes} {...styles.tag}>
      <IconFolder {...styles.icon} size={24} />
      {children}
    </div>
  )
}

export default Tag
