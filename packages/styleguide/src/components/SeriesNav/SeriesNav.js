import React from 'react'
import { css } from 'glamor'
import PropTypes from 'prop-types'
import { TeaserCarousel, TeaserCarouselTileContainer } from '../TeaserCarousel'
import {
  InfoBox,
  InfoBoxTitle,
  InfoBoxText,
  INFOBOX_IMAGE_SIZES,
} from '../InfoBox'
import { Figure, FigureImage } from '../Figure'
import { InvertedColorScheme } from '../Colors/ColorContext'
import Center, { PADDED_MAX_WIDTH_BREAKOUT } from '../Center'
import SeriesNavTile from './SeriesNavTile'
import { Editorial } from '../Typography'

const DEFAULT_PAYNOTE_INDEX = 2

const styles = {
  container: css({
    maxWidth: PADDED_MAX_WIDTH_BREAKOUT,
    margin: '0 auto',
    padding: 0,
  }),
  containerInline: css({
    margin: '0 auto',
    padding: 0,
    width: '100%',
  }),
  description: css({
    padding: '0px 15px',
  }),
  plainlink: css({
    textDecoration: 'none',
    color: 'inherit',
  }),
  hidePrint: css({
    '@media print': {
      display: 'none',
    },
  }),
}

const DefaultLink = ({ children }) => children

function SeriesNav({
  t,
  repoId,
  series,
  inline,
  inlineAfterDescription,
  ActionBar,
  Link = DefaultLink,
  context,
  PayNote,
  onEpisodeClick,
  aboveTheFold,
  seriesDescription,
}) {
  const showSeriesDescripion = seriesDescription ?? (inline ? true : undefined)

  const currentTile =
    repoId &&
    series.episodes.find((episode) => episode.document?.repoId === repoId)
  const currentTileIndex = currentTile && series.episodes.indexOf(currentTile)

  // add paynote after current episode or to third card if no current episode
  const payNotePosition = currentTile
    ? Math.max(currentTileIndex + 1, DEFAULT_PAYNOTE_INDEX)
    : DEFAULT_PAYNOTE_INDEX
  const episodes =
    PayNote && !inline
      ? [
          ...series.episodes.slice(0, payNotePosition),
          { isPayNote: true }, // placeholder object to trigger special tile
          ...series.episodes.slice(payNotePosition),
        ]
      : [...series.episodes]

  const titlePath =
    series.overview?.meta?.path || series.episodes[0]?.meta?.path

  const logoProps =
    series.logo &&
    FigureImage.utils.getResizedSrcs(
      series.logo,
      series.logoDark,
      INFOBOX_IMAGE_SIZES.XXS,
      false,
    )

  return (
    <div {...(inline ? styles.containerInline : styles.container)}>
      {inline ? (
        <Center>
          <InfoBox figureSize={series.logo && 'XXS'} margin={false}>
            {series.logo && (
              <Figure>
                <FigureImage
                  maxWidth={INFOBOX_IMAGE_SIZES.XXS}
                  aboveTheFold={aboveTheFold}
                  {...logoProps}
                  alt=''
                />
              </Figure>
            )}
            <InfoBoxTitle>
              {titlePath ? (
                <Link href={titlePath} legacyBehavior passHref>
                  <a {...styles.plainlink}>{series.title}</a>
                </Link>
              ) : (
                series.title
              )}
            </InfoBoxTitle>
            {showSeriesDescripion && (
              <InfoBoxText>
                {series.description}
                {titlePath &&
                  t.elements('styleguide/SeriesNav/seriesoverview/link', {
                    link: (
                      <Link key='link' href={titlePath} passHref legacyBehavior>
                        <Editorial.A>
                          {t('styleguide/SeriesNav/seriesoverview')}
                        </Editorial.A>
                      </Link>
                    ),
                  })}
              </InfoBoxText>
            )}
          </InfoBox>
          {inlineAfterDescription}
        </Center>
      ) : showSeriesDescripion ? (
        <Editorial.P style={{ padding: '0px 15px' }}>
          {series.description}
        </Editorial.P>
      ) : null}

      <div {...styles.hidePrint}>
        <TeaserCarousel grid={!inline} isSeriesNav>
          <TeaserCarouselTileContainer
            initialScrollTileIndex={currentTileIndex}
            isSeriesNav
          >
            {episodes.map((episode, i) => {
              return (
                <SeriesNavTile
                  key={i}
                  index={i}
                  repoId={repoId}
                  context={context}
                  PayNote={episode.isPayNote && PayNote}
                  current={repoId && repoId === episode?.document?.repoId}
                  episode={episode}
                  inline={inline}
                  ActionBar={ActionBar}
                  Link={Link}
                  onEpisodeClick={onEpisodeClick}
                  aboveTheFold={aboveTheFold}
                  t={t}
                />
              )
            })}
          </TeaserCarouselTileContainer>
        </TeaserCarousel>

        {inline && PayNote && (
          <InvertedColorScheme>
            <PayNote context={context} repoId={repoId} inline />
          </InvertedColorScheme>
        )}
      </div>
    </div>
  )
}

SeriesNav.propTypes = {
  repoId: PropTypes.string,
  series: PropTypes.object.isRequired,
  ActionBar: PropTypes.func,
  Link: PropTypes.elementType,
  PayNote: PropTypes.func,
  inline: PropTypes.bool,
  height: PropTypes.number,
  onEpisodeClick: PropTypes.func,
  t: PropTypes.func.isRequired,
  seriesDescription: PropTypes.bool,
}

export default SeriesNav
