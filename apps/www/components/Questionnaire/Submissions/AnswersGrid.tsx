import { css } from 'glamor'
import { ReactNode } from 'react'
import { mediaQueries } from '@project-r/styleguide'

const styles = {
  grid: css({
    display: 'grid',
    gap: '24px',
    gridAutoRows: 'auto',
    gridAutoFlow: 'row dense',
    padding: '48px 0',
    [mediaQueries.mUp]: {
      gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    },
  }),
  card: css({
    transition: 'transform .3s ease-in-out',
    ':hover': {
      transform: 'scale(1.03) !important',
    },
  }),
}

export const AnswersGrid = ({ children }: { children: ReactNode }) => {
  return <div {...styles.grid}>{children}</div>
}

export const AnswersGridCard = ({
  textLength,
  children,
}: {
  textLength: number
  children: ReactNode
}) => {
  return (
    <div
      {...styles.card}
      style={{
        gridRow: `span ${Math.max(1, Math.round(textLength / 60))}`, // Tweak the numerator here to adjust relative height of the cards in the grid
      }}
    >
      {children}
    </div>
  )
}
