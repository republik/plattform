import React from 'react'
import { css } from 'glamor'
import PropTypes from 'prop-types'
import { TeaserCarousel, TeaserCarouselTileContainer } from '../TeaserCarousel'
import {
  InfoBox,
  InfoBoxTitle,
  InfoBoxText,
  INFOBOX_IMAGE_SIZES
} from '../InfoBox'
import { Figure, FigureImage } from '../Figure'
import { ColorContextLocalExtension } from '../Colors/ColorContext'
import { useColorContext } from '../Colors/useColorContext'
import Center, { PADDED_MAX_WIDTH_BREAKOUT } from '../Center'
import SeriesNavTile from './SeriesNavTile'
import { localInvertedColors } from '../../theme/colors'

const DEFAULT_PAYNOTE_INDEX = 2

const styles = {
  container: css({
    maxWidth: PADDED_MAX_WIDTH_BREAKOUT,
    margin: '0 auto',
    padding: 0
  }),
  containerInline: css({
    margin: '0 auto',
    padding: 0,
    width: '100%'
  }),
  plainlink: css({
    textDecoration: 'none',
    color: 'inherit'
  })
}

const DefaultLink = ({ children }) => children

function SeriesNav({
  repoId,
  series,
  inline,
  inlineAfterDescription,
  ActionBar,
  Link = DefaultLink,
  context,
  PayNote,
  onEpisodeClick
}) {
  const [colorScheme] = useColorContext()

  const currentTile =
    repoId &&
    series.episodes.find(episode => episode.document?.repoId === repoId)
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
          ...series.episodes.slice(payNotePosition)
        ]
      : [...series.episodes]

  const titlePath =
    series.overview?.meta?.path || series.episodes[0]?.meta?.path

  const logoProps =
    series.logo &&
    FigureImage.utils.getResizedSrcs(
      series.logo,
      INFOBOX_IMAGE_SIZES.XXS,
      false
    )
  const logoDarkProps =
    series.logoDark &&
    FigureImage.utils.getResizedSrcs(
      series.logoDark,
      INFOBOX_IMAGE_SIZES.XXS,
      false
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
                  {...logoProps}
                  dark={logoDarkProps}
                  alt=''
                />
              </Figure>
            )}
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
          </InfoBox>
          {inlineAfterDescription}
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
              />
            )
          })}
        </TeaserCarouselTileContainer>
      </TeaserCarousel>

      {inline && PayNote && (
        <div {...colorScheme.set('backgroundColor', 'defaultInverted')}>
          <ColorContextLocalExtension localColors={localInvertedColors}>
            <PayNote context={context} repoId={repoId} inline />
          </ColorContextLocalExtension>
        </div>
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
