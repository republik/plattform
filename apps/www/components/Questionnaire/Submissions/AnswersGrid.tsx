import { css } from 'glamor'
import { ReactNode } from 'react'
import { mediaQueries } from '@project-r/styleguide'

const styles = {
  grid: css({
    columnCount: 1,
    columnGap: '1em',
    margin: '30px 0 40px',
    [mediaQueries.mUp]: {
      columnCount: 2,
    },
    [mediaQueries.lUp]: {
      columnCount: 3,
    },
  }),
  card: css({
    display: 'table',
    width: '100%',
    padding: '0.5em 0',
    breakInside: 'avoid',
    transition: 'all .3s ease-in-out',
    ':hover': {
      transform: 'scale(1.03) !important',
      '& span': {
        color: '#757575',
      },
    },
  }),
}

export const AnswersGrid = ({ children }: { children: ReactNode }) => {
  return <div {...styles.grid}>{children}</div>
}

export const AnswersGridCard = ({ children }: { children: ReactNode }) => {
  return <div {...styles.card}>{children}</div>
}
