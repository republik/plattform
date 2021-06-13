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
    marginBottom: 20,
    width: '100%',
    padding: TILE_GRID_PADDING,
    [`@media only screen and (min-width: ${OUTER_CONTAINER_PADDING * 2 +
      GRID_MIN_WIDTH * 2}px)`]: {
      width: '50%'
    },
    [`@media only screen and (min-width: ${OUTER_CONTAINER_PADDING * 2 +
      GRID_MIN_WIDTH * 3}px)`]: {
      width: '33.33%'
    }
  }),
  inlineTile: css({
    marginRight: TILE_MARGIN_RIGHT,
    padding: 7,
    width: '20%',
    minWidth: 150,
    maxWidth: 170
  })
}

const SeriesNavTile = ({
  episode,
  current,
  inline,
  ActionBar,
  Link,
  index,
  repoId,
  context,
  PayNote,
  onEpisodeClick
}) => {
  const [colorScheme] = useColorContext()

  const isInverted = !!(current || PayNote)
  const content = PayNote ? (
    <PayNote context={context} repoId={repoId} index={index} />
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
      {...(isInverted && colorScheme.set('backgroundColor', 'defaultInverted'))}
      style={{
        opacity: inactiveTile ? 0.6 : 1
      }}
      data-repo-id={episode?.document?.repoId}
    >
      {isInverted ? (
        <ColorContextLocalExtension localColors={localInvertedColors}>
          {content}
        </ColorContextLocalExtension>
      ) : (
        content
      )}
    </div>
  )
}

export default SeriesNavTile
