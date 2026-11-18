import { css, cx } from '@republik/theme/css'
import type { ReactNode } from 'react'

const groupStyle = css({
  display: 'grid',
  gridTemplateColumns: { base: '1fr', lg: '150px 1fr' },
  columnGap: '8',
  alignItems: 'start',
  '&:first-child > h2': {
    lg: {
      borderTopWidth: 0,
      pt: 0,
    },
  },
  '&:first-child > div': {
    lg: {
      borderTopWidth: 0,
      pt: 0,
    },
  },
})

const dateHeaderStyle = css({
  borderTopWidth: 1,
  borderTopStyle: 'solid',
  borderTopColor: 'divider',
  py: '4',
  whiteSpace: 'pre-line',
  textStyle: 'sans',
  fontSize: 's',
  position: 'sticky',
  top: '0',
  alignSelf: 'start',
  background: 'pageBackground',
  zIndex: 1,
  lg: { pb: '6' },
})

const itemsStyle = css({
  borderTopWidth: 1,
  borderTopStyle: 'solid',
  borderTopColor: 'divider',
  pt: '6',
})

/**
 * A day's worth of items with a sticky date heading: above the items on small
 * screens, in a column to their left on large ones. Use with `groupByDate`.
 */
export function DateGroup({
  label,
  labelLg,
  children,
}: {
  label: string
  labelLg: string
  children: ReactNode
}) {
  return (
    <section className={groupStyle}>
      <h2
        className={cx(
          dateHeaderStyle,
          css({ display: 'block', lg: { display: 'none' } }),
        )}
      >
        {label}
      </h2>
      <h2
        className={cx(
          dateHeaderStyle,
          css({ display: 'none', lg: { display: 'block' } }),
        )}
      >
        {labelLg}
      </h2>
      <div className={itemsStyle}>{children}</div>
    </section>
  )
}
