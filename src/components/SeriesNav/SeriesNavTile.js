import React from 'react'
import { css } from 'glamor'

import { ColorContextLocalExtension } from '../Colors/ColorContext'
import { useColorContext } from '../Colors/useColorContext'
import {
  PADDING,
  TILE_MARGIN_RIGHT,
  TILE_MAX_WIDTH,
  TILE_GRID_PADDING
} from '../TeaserCarousel/constants'

import SeriesNavTileContent from './SeriesNavTileContent'

const GRID_MIN_WIDTH = 345
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
    minWidth: 200,
    maxWidth: TILE_MAX_WIDTH,
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
  const localColors =
    current || !!PayNote
      ? {
          light: {
            default: '#191919',
            text: '#f0f0f0'
          },
          dark: {
            default: '#ffffff',
            text: '#282828'
          }
        }
      : { light: {}, dark: {} }
  const inactiveTile = !PayNote && !current && !episode?.document?.meta?.path
  // TODO: support isReadable
  //(!episode?.document?.meta?.path || !episode.isReadable)

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
        <ColorContextLocalExtension localColors={localColors}>
          {PayNote ? (
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
          )}
        </ColorContextLocalExtension>
      </div>
    </div>
  )
}

export default SeriesNavTile
