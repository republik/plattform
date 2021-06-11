import React from 'react'
import { css } from 'glamor'
import PropTypes from 'prop-types'
import { TeaserCarousel, TeaserCarouselTileContainer } from '../TeaserCarousel'
import { InfoBoxTitle, InfoBoxText, INFOBOX_IMAGE_SIZES } from '../InfoBox'
import { FigureImage } from '../Figure'
import { ColorContextLocalExtension } from '../Colors/ColorContext'
import Center, { BREAKOUT_SIZES } from '../Center'
import SeriesNavTile from './SeriesNavTile'
import { localInvertedColors } from '../../theme/colors'

const DEFAULT_PAYNOTE_INDEX = 2

const styles = {
  container: css({
    maxWidth: BREAKOUT_SIZES['breakout'],
    margin: '0 auto',
    padding: 0
  }),
  containerInline: css({
    margin: '0 auto',
    padding: 0,
    width: '100%'
  }),
  infoBoxContainer: css({
    display: 'flex'
  }),
  plainlink: css({
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer'
  })
}

const DefaultLink = ({ children }) => children

function SeriesNav({
  repoId,
  series,
  inline,
  ActionBar,
  Link = DefaultLink,
  PayNote,
  onEpisodeClick
}) {
  const currentTile =
    repoId &&
    series.episodes.find(episode => episode.document?.repoId === repoId)
  const currentTileIndex = currentTile && series.episodes.indexOf(currentTile)

  // add paynote object after current episode or to third card if no current episode
  const payNoteObject = { isPayNote: true }
  const payNotePosition = currentTile
    ? Math.max(currentTileIndex + 1, DEFAULT_PAYNOTE_INDEX)
    : DEFAULT_PAYNOTE_INDEX
  const episodes =
    PayNote && !inline
      ? [
          ...series.episodes.slice(0, payNotePosition),
          payNoteObject,
          ...series.episodes.slice(payNotePosition)
        ]
      : [...series.episodes]

  const titlePath =
    series.overview?.meta?.path || series.episodes[0]?.meta?.path

  const logoProps =
    series.logo &&
    FigureImage.utils.getResizedSrcs(series.logo, INFOBOX_IMAGE_SIZES.XS, false)
  const logoDarkProps =
    series.logoDark &&
    FigureImage.utils.getResizedSrcs(
      series.logoDark,
      INFOBOX_IMAGE_SIZES.XS,
      false
    )

  return (
    <div {...(inline ? styles.containerInline : styles.container)}>
      {inline ? (
        <Center {...styles.infoBoxContainer}>
          {series.logo && (
            <FigureImage
              maxWidth={INFOBOX_IMAGE_SIZES.XS}
              {...logoProps}
              dark={logoDarkProps}
              alt=''
            />
          )}
          <div style={{ marginLeft: series.logo && 16 }}>
            <InfoBoxTitle>
              {titlePath ? (
                <Link href={titlePath} passHref>
                  <a {...styles.plainlink}>{series.title}</a>
                </Link>
              ) : (
                series.title
              )}
            </InfoBoxTitle>
            <InfoBoxText>{series.description}</InfoBoxText>
          </div>
        </Center>
      ) : null}

      <TeaserCarousel grid={!inline} isSeriesNav>
        <TeaserCarouselTileContainer
          initialScrollTileIndex={currentTileIndex}
          isSeriesNav
        >
          {episodes.map((episode, i) => {
            return (
              <SeriesNavTile
                key={i}
                PayNote={episode.isPayNote && PayNote}
                current={repoId && repoId === episode?.document?.repoId}
                episode={episode}
                inline={inline}
                ActionBar={ActionBar}
                Link={Link}
                onEpisodeClick={onEpisodeClick}
              />
            )
          })}
        </TeaserCarouselTileContainer>
      </TeaserCarousel>

      {inline && PayNote && (
        <ColorContextLocalExtension localColors={localInvertedColors}>
          <PayNote inline={inline} />
        </ColorContextLocalExtension>
      )}
    </div>
  )
}

SeriesNav.propTypes = {
  repoId: PropTypes.string,
  series: PropTypes.object.isRequired,
  ActionBar: PropTypes.func,
  Link: PropTypes.func,
  PayNote: PropTypes.func,
  inline: PropTypes.bool,
  height: PropTypes.number,
  onEpisodeClick: PropTypes.func
}

export default SeriesNav
