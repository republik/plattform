import { css } from 'glamor'
import { ReactNode } from 'react'

const styles = {
  grid: css({
    display: 'grid',
    gap: '24px',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gridAutoRows: 'auto',
    gridAutoFlow: 'row dense',
    padding: '48px 0',
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
      style={{
        gridRow: `span ${Math.max(1, Math.round(textLength / 60))}`, // Tweak the numerator here to adjust relative height of the cards in the grid
      }}
    >
      {children}
    </div>
  )
}
