import React from 'react'
import { Flyer } from '../Typography'
import { timeFormat, timeParse } from '../../lib/timeFormat'
import { mUp } from '../../theme/mediaQueries'
import { css } from 'glamor'

export const FLYER_DATE_FORMAT = '%Y-%m-%d'

export const parseDate = timeParse(FLYER_DATE_FORMAT)
export const renderDate = timeFormat('%A, %d. %B')

export const FlyerDate: React.FC<{
  date?: Date
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, date, ...props }) => {
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
      <Flyer.Small contentEditable={false} style={{ opacity: date ? 1 : 0.33 }}>
        {date ? renderDate(parseDate(date)) : 'Datum'}
      </Flyer.Small>
      {children}
    </div>
  )
}
