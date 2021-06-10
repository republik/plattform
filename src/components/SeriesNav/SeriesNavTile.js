import React from 'react'
import { css } from 'glamor'

import { ColorContextLocalExtension } from '../Colors/ColorContext'
import { useColorContext } from '../Colors/useColorContext'
import {
  PADDING,
  TILE_MARGIN_RIGHT,
  TILE_GRID_PADDING
} from '../TeaserCarousel/constants'

import SeriesNavTileContent from './SeriesNavTileContent'

import { localInvertedColors } from '../../theme/colors'

const GRID_MIN_WIDTH = 315
const OUTER_CONTAINER_PADDING = PADDING

const styles = {
  tile: css({
    padding: `0px 0px 20px 0px`,
    width: '100%',
    [`@media only screen and (min-width: ${OUTER_CONTAINER_PADDING * 2 +
      GRID_MIN_WIDTH * 2}px)`]: {
      width: '50%',
      padding: `0px ${TILE_GRID_PADDING}px 20px ${TILE_GRID_PADDING}px`
    },
    [`@media only screen and (min-width: ${OUTER_CONTAINER_PADDING * 2 +
      GRID_MIN_WIDTH * 3}px)`]: {
      width: '33.33%',
      padding: `0px ${TILE_GRID_PADDING}px 20px ${TILE_GRID_PADDING}px`
    }
  }),
  inlineTile: css({
    marginRight: TILE_MARGIN_RIGHT,
    width: '20%',
    minWidth: 150,
    maxWidth: 170,
    ':last-of-type': { margin: 0 }
  }),
  tileContainer: css({
    padding: 6
  })
}

const SeriesNavTile = ({
  episode,
  current,
  inline,
  ActionBar,
  Link,
  PayNote,
  onEpisodeClick
}) => {
  const [colorScheme] = useColorContext()

  const isInverted = !!(current || PayNote)
  const content = PayNote ? (
    <PayNote />
  ) : (
    <SeriesNavTileContent
      inline={inline}
      episode={episode}
      current={current}
      ActionBar={ActionBar}
      Link={Link}
      onEpisodeClick={onEpisodeClick}
    />
  )
  const inactiveTile = !isInverted && !episode?.document?.meta?.path

  return (
    <div
      {...(inline ? styles.inlineTile : styles.tile)}
      style={{
        opacity: inactiveTile ? 0.6 : 1
      }}
    >
      <div
        {...styles.tileContainer}
        {...colorScheme.set(
          'backgroundColor',
          current || !!PayNote ? 'defaultInverted' : 'transparent'
        )}
      >
        {isInverted ? (
          <ColorContextLocalExtension localColors={localInvertedColors}>
            {content}
          </ColorContextLocalExtension>
        ) : (
          content
        )}
      </div>
    </div>
  )
}

export default SeriesNavTile
