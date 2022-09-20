import React from 'react'
import { Flyer } from '../Typography'
import { timeFormat, timeParse } from '../../lib/timeFormat'
import { mUp } from '../../theme/mediaQueries'
import { css } from 'glamor'

export const FLYER_DATE_FORMAT = '%Y-%m-%d'
const RENDER_FORMAT_CURRENT_YEAR = '%A, %-d. %B'
const RENDER_FORMAT = '%A, %-d. %B %Y'

export const parseDate = timeParse(FLYER_DATE_FORMAT)

const isCurrentYear = (date?: Date): boolean =>
  date && date.getFullYear() === new Date().getFullYear()

export const FlyerDate: React.FC<{
  date?: string
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, date, ...props }) => {
  const parsedDate = date && parseDate(date)
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
        {date
          ? timeFormat(
              isCurrentYear(parsedDate)
                ? RENDER_FORMAT_CURRENT_YEAR
                : RENDER_FORMAT,
            )(parsedDate)
          : 'Datum'}
      </Flyer.Small>
      {children}
    </div>
  )
}
