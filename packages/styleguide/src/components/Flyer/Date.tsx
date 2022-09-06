import React from 'react'
import { Flyer } from '../Typography'
import { timeFormat } from '../../lib/timeFormat'
import { mUp } from '../../theme/mediaQueries'
import { css } from 'glamor'

export const FlyerDate: React.FC<{
  value?: Date
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, value, ...props }) => {
  const isDate = value instanceof Date && !isNaN(value.valueOf())
  return (
    <div
      {...attributes}
      {...props}
      {...css({
        margin: '0 0 22px',
        [mUp]: {
          margin: '0 0 16px',
        },
      })}
    >
      <Flyer.Small
        contentEditable={false}
        style={{ opacity: isDate ? 1 : 0.33 }}
      >
        {isDate ? timeFormat('%A, %d. %B')(value) : 'Datum'}
      </Flyer.Small>
      {children}
    </div>
  )
}
