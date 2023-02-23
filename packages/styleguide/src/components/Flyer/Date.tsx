import React, { ReactNode } from 'react'
import { Flyer } from '../Typography'
import { timeFormat, timeParse } from '../../lib/timeFormat'
import { useRenderContext } from '../Editor/Render/Context'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'

export const FLYER_DATE_FORMAT = '%Y-%m-%d'
const RENDER_FORMAT_CURRENT_YEAR = '%A, %-d. %B'
const RENDER_FORMAT = '%A, %-d. %B %Y'

export const parseDate = timeParse(FLYER_DATE_FORMAT)

const isCurrentYear = (date?: Date): boolean =>
  date && date.getFullYear() === new Date().getFullYear()

export const FlyerDate: React.FC<{
  date?: string
}> = ({ date }) => {
  const parsedDate = date && parseDate(date.split('T')[0])
  return (
    <Flyer.Small contentEditable={false} style={{ opacity: date ? 1 : 0.33 }}>
      {date
        ? timeFormat(
            isCurrentYear(parsedDate)
              ? RENDER_FORMAT_CURRENT_YEAR
              : RENDER_FORMAT,
          )(parsedDate)
        : 'Publikationsdatum'}
    </Flyer.Small>
  )
}

export const FlyerNav: React.FC<{
  children?: ReactNode
  attributes: any
  [x: string]: unknown
}> = ({ attributes, children, ...props }) => {
  const { nav } = useRenderContext()
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
      <div contentEditable={false}>{nav}</div>
      {children}
    </div>
  )
}
