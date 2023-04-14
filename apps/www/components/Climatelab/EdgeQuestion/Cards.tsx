import { css } from 'glamor'
import NextLink from 'next/link'
import React from 'react'

import {
  useColorContext,
  Editorial,
  inQuotes,
  slug,
  fontStyles,
  ColorContextLocalExtension,
  ChevronRightIcon,
  mediaQueries,
} from '@project-r/styleguide'

import { localColors } from './config'
import { CardProps } from '.'

const styles = {
  grid: css({
    display: 'flex',
    flexDirection: 'column',
    // gap: '1rem',
    marginBottom: 20,
  }),
  card: css({
    marginBottom: 10,
    padding: 10,
    maxWidth: '700px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px 10px 10px 3px',
    transition: '500ms filter',
    ':hover': {
      filter: 'brightness(85%)',
    },
  }),
  boldCitation: css({
    ...fontStyles.serifBold24,
    [mediaQueries.mUp]: {
      ...fontStyles.serifBold32,
    },
  }),
}

const GetColorScheme = ({ children }) => {
  const [colorScheme] = useColorContext()

  return children(colorScheme)
}

const Card: React.FC<{
  card: CardProps
  idx: number
}> = ({ card, idx }) => {
  const { name, excerpt, color, tagline } = card
  const onClick = () => {
    const classElements = document.getElementsByClassName(slug(name))
    if (!classElements?.length) return
    const element = classElements[0]
    if (element) {
      element.scrollIntoView()
    }
  }
  return (
    <div
      {...styles.card}
      style={{
        alignSelf: idx % 3 === 0 ? 'flex-end' : 'flex-start',
        textAlign: idx % 3 === 0 ? 'right' : 'left',
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      <ColorContextLocalExtension localColors={localColors}>
        <GetColorScheme>
          {(colorScheme) => (
            <>
              <div>
                <Editorial.Question
                  style={{ marginTop: 0 }}
                  {...styles.boldCitation}
                  {...colorScheme.set('color', color)}
                >
                  {inQuotes(excerpt)}
                </Editorial.Question>
                <Editorial.Credit
                  style={{
                    marginTop: '0',
                    paddingTop: '20px',
                    textDecoration: 'underline',
                  }}
                  {...colorScheme.set('color', color)}
                >
                  <span>{name}</span>
                  <span>
                    {', '}
                    {tagline}
                  </span>
                  <ChevronRightIcon />
                </Editorial.Credit>
              </div>
            </>
          )}
        </GetColorScheme>
      </ColorContextLocalExtension>
    </div>
  )
}

const CardsOverview: React.FC<{ overviewData: CardProps[] }> = ({
  overviewData,
}) => {
  if (!overviewData) return
  return (
    <div {...styles.grid}>
      {overviewData.map((card, idx) => (
        <Card card={card} key={idx} idx={idx} />
      ))}
    </div>
  )
}

export default CardsOverview
