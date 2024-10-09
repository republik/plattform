import React, { ComponentPropsWithoutRef } from 'react'
import { css } from 'glamor'
import { mUp } from '../TeaserFront/mediaQueries'

const styles = {
  container: css({
    backgroundColor: '#f5f5f5',
    position: 'relative',
    lineHeight: 0,
    margin: 0,
    padding: '30px 15px',
    [mUp]: {
      padding: '60px 0',
    },
  }),
}

type TeaserProps = {
  children: React.ReactNode
  attributes?: ComponentPropsWithoutRef<'div'>
  onClick?: ComponentPropsWithoutRef<'div'>['onClick']
}

const Teaser = ({ children, attributes, onClick }: TeaserProps) => {
  return (
    <div
      {...attributes}
      {...styles.container}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {children}
    </div>
  )
}

export default Teaser
