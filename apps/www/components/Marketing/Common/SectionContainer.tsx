import { css } from 'glamor'
import { mediaQueries } from '@project-r/styleguide'
import { ReactNode } from 'react'

type SectionContainerProps = {
  children: ReactNode
  maxWidth: number
  padding?: number
}

export default function SectionContainer({
  children,
  maxWidth,
  padding,
}: SectionContainerProps) {
  return (
    <div
      {...sectionContainerStyle}
      style={{ maxWidth: maxWidth ?? 1280, padding }}
    >
      {children}
    </div>
  )
}

export const sectionContainerStyle = css({
  margin: '0 auto',
  marginTop: '5em',
  padding: '0px 15px',
  [mediaQueries.mUp]: {
    marginTop: '8em',
  },
})
