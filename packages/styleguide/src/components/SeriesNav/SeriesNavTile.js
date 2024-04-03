import React from 'react'
import { css } from 'glamor'

import { InvertedColorScheme } from '../Colors/ColorContext'
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
  paynoteLabelSpace: css({
    marginTop: 0,
    ...sansSerifRegular12,
    [mUp]: {
      ...sansSerifRegular14,
    },
  }),
}

const SeriesNavTile = ({
  t,
  episode,
  current,
  inline,
  ActionBar,
  Link,
  index,
  repoId,
  context,
  PayNote,
  onEpisodeClick,
  aboveTheFold,
}) => {
  const isInverted = !!PayNote
  const content = PayNote ? (
    <>
      <p {...styles.paynoteLabelSpace}>&nbsp;</p>
      <PayNote context={context} repoId={repoId} index={index} />
    </>
  ) : (
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
  )
  const inactiveTile = !isInverted && !episode?.document?.meta?.path

  return (
    <div
      /* 
      Hide PayNote for members by setting the data-hide-if-active-membership attribute. 
      This class is defined in the MeContext in republik-frontend
      */
      {...(PayNote && {
        'data-hide-if-active-membership': true,
      })}
      {...(inline ? styles.inlineTile : styles.tile)}
      style={{
        opacity: inactiveTile ? 0.6 : 1,
      }}
      data-repo-id={episode?.document?.repoId}
    >
      {isInverted ? (
        <InvertedColorScheme>{content}</InvertedColorScheme>
      ) : (
        content
      )}
    </div>
  )
}

export default SeriesNavTile
