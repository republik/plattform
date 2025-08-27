import React from 'react'
import { css } from 'glamor'

import {
  PADDING,
  TILE_MARGIN_RIGHT,
  TILE_GRID_PADDING,
} from '../TeaserCarousel/constants'
import { mUp } from '../../theme/mediaQueries'
import SeriesNavTileContent from './SeriesNavTileContent'
import { sansSerifRegular14, sansSerifRegular12 } from '../Typography/styles'

const GRID_MIN_WIDTH = 300
const OUTER_CONTAINER_PADDING = PADDING

const styles = {
  tile: css({
    marginBottom: 20,
    width: '100%',
    minWidth: GRID_MIN_WIDTH,
    padding: TILE_GRID_PADDING,
    [`@media only screen and (min-width: ${
      OUTER_CONTAINER_PADDING * 2 + GRID_MIN_WIDTH * 2
    }px)`]: {
      width: '50%',
    },
    [`@media only screen and (min-width: ${
      OUTER_CONTAINER_PADDING * 2 + GRID_MIN_WIDTH * 3
    }px)`]: {
      width: '33.33%',
    },
  }),
  inlineTile: css({
    marginRight: TILE_MARGIN_RIGHT,
    padding: 7,
    width: '20%',
    minWidth: 150,
    maxWidth: 170,
  }),
}

const SeriesNavTile = ({
  t,
  episode,
  current,
  inline,
  ActionBar,
  Link,
  onEpisodeClick,
  aboveTheFold,
}) => {
  const inactiveTile = !episode?.document?.meta?.path

  return (
    <div
      {...(inline ? styles.inlineTile : styles.tile)}
      style={{
        opacity: inactiveTile ? 0.6 : 1,
      }}
      data-repo-id={episode?.document?.repoId}
    >
      <SeriesNavTileContent
        inline={inline}
        episode={episode}
        current={current}
        ActionBar={ActionBar}
        Link={Link}
        onEpisodeClick={onEpisodeClick}
        aboveTheFold={aboveTheFold}
        t={t}
      />
    </div>
  )
}

export default React.memo(SeriesNavTile)
