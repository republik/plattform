import { css } from 'glamor'
import { ReactNode } from 'react'
import { Editorial, inQuotes, mediaQueries } from '@project-r/styleguide'

const styles = {
  grid: css({
    columnCount: 1,
    columnGap: 0,
    margin: '30px 0 40px',
    [mediaQueries.mUp]: {
      columnCount: 2,
    },
    [mediaQueries.lUp]: {
      columnCount: 3,
    },
  }),
  card: css({
    display: 'block',
    width: '100%',
    padding: '0.5em',
    breakInside: 'avoid',
  }),
  answer: css({
    background: 'rgba(255,255,255,0.5)',
    borderRadius: 10,
    padding: 24,
    color: 'black',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
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

export const Answer = ({ answer, author }) => {
  return (
    <div {...styles.answer}>
      <div style={{ width: '100%' }}>
        <Editorial.Question style={{ marginTop: 0 }}>
          {inQuotes(answer?.payload?.value ?? '')}
        </Editorial.Question>
        <Editorial.Credit
          style={{
            marginTop: '0',
            paddingTop: '20px',
          }}
        >
          Von <span style={{ textDecoration: 'underline' }}>{author.name}</span>
        </Editorial.Credit>
      </div>
    </div>
  )
}
