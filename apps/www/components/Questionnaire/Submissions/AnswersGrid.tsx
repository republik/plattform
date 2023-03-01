import { css } from 'glamor'
import { ReactNode } from 'react'
import { mediaQueries } from '@project-r/styleguide'

const styles = {
  grid: css({
    display: 'flex',
    columnWidth: '360px',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: 30,
    [mediaQueries.mUp]: {
      columnWidth: '360px',
    },
  }),
  card: css({
    breakInside: 'avoid',
    transition: 'transform .3s ease-in-out',
    ':hover': {
      transform: 'scale(1.03) !important',
    },
    [mediaQueries.mUp]: {
      width: '360px',
    },
  }),
}

export const AnswersGrid = ({ children }: { children: ReactNode }) => {
  return <div {...styles.grid}>{children}</div>
}

export const AnswersGridCard = ({
  children,
}: {
  textLength: number
  children: ReactNode
}) => {
  return <div {...styles.card}>{children}</div>
}
