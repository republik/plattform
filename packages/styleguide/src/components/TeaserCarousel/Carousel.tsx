import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'

import CarouselContext, { defaultValue } from './Context'
import { PADDING, TILE_MAX_WIDTH } from './constants'
import { MAX_WIDTH } from '../Center'
import { useColorContext } from '../Colors/useColorContext'

const styles = {
  carousel: css({
    padding: `30px ${PADDING}px ${30 - PADDING}px`,
  }),
  articleMargin: css({
    margin: '20px 0',
    '& ~ &': {
      marginTop: -20,
    },
  }),
}

type CarouselProps = {
  bgColor?: string
  color?: string
  outline: string | boolean
  bigger: boolean
  children: React.ReactNode
  tileCount: number
  article?: boolean
  grid?: boolean
  isSeriesNav?: boolean
}

export const Carousel = ({
  bigger,
  children,
  tileCount: tileCountFromProps,
  article,
  outline,
  bgColor = defaultValue.bgColor,
  color = defaultValue.color,
  grid,
  isSeriesNav,
}: CarouselProps) => {
  const [colorScheme] = useColorContext()
  const row = children && children[1]
  const tileCount =
    tileCountFromProps ||
    (row && React.Children.count(row.props && row.props.children))
  const tileMaxWidth = grid
    ? 0
    : article
    ? MAX_WIDTH / 2 // optimised to align with article column
    : TILE_MAX_WIDTH

  return (
    <CarouselContext.Provider
      value={{
        bigger,
        outline,
        bgColor,
        color,
        tileCount,
        tileMaxWidth,
        grid,
      }}
    >
      <section
        {...styles.carousel}
        {...colorScheme.set('backgroundColor', bgColor)}
        {...colorScheme.set('color', color || 'inherit')}
        {...(article ? styles.articleMargin : undefined)}
        style={{
          ...(isSeriesNav
            ? {
                paddingTop: 0,
                paddingBottom: 0,
              }
            : {}),
        }}
      >
        <div
          style={{
            margin: '0 auto',
            maxWidth: grid
              ? TILE_MAX_WIDTH * 5
              : tileCount
              ? tileCount * tileMaxWidth
              : undefined,
          }}
        >
          {children}
        </div>
      </section>
    </CarouselContext.Provider>
  )
}

export default React.memo(Carousel)
