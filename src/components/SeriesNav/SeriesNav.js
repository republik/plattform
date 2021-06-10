import React from 'react'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import PropTypes from 'prop-types'
import {
  TeaserCarousel,
  TeaserCarouselTileContainer
} from '../../components/TeaserCarousel'
import { useColorContext } from '../Colors/useColorContext'
import { ColorContextLocalExtension } from '../Colors/ColorContext'
import { serifBold19, serifRegular17, serifBold17 } from '../Typography/styles'
import Center, { BREAKOUT_SIZES } from '../../components/Center'
import SeriesNavTile from './SeriesNavTile'

const DEFAULT_PAYNOTE_INDEX = 2

const styles = {
  container: css({
    maxWidth: BREAKOUT_SIZES['breakout'],
    margin: '0 auto',
    padding: '0 15px'
  }),
  containerInline: css({
    margin: '0 auto',
    padding: 0,
    width: '100%'
  }),
  hline: css({
    borderWidth: 0,
    borderTopWidth: 1,
    borderStyle: 'solid',
    margin: 0,
    marginBottom: 15,
    [mUp]: {
      display: 'none'
    }
  }),
  title: css({
    ...serifBold17,
    marginBottom: 4,
    [mUp]: {
      ...serifBold19
    }
  }),
  description: css({
    ...serifRegular17,
    margin: 0,
    marginBottom: 5
  }),
  plainlink: css({
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer'
  })
}

const DefaultLink = ({ children }) => children

function SeriesNav({
  documentId,
  series,
  inline,
  ActionBar,
  Link = DefaultLink,
  PayNote,
  onEpisodeClick
}) {
  const [colorScheme] = useColorContext()

  const currentTile =
    documentId &&
    series.episodes.find(episode => episode.document?.id === documentId)
  const currentTileIndex = series.episodes.indexOf(currentTile)

  const localColors = {
    light: {
      default: '#191919',
      text: '#f0f0f0'
    },
    dark: {
      default: '#ffffff',
      text: '#282828'
    }
  }

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

  return (
    <div {...(inline ? styles.containerInline : styles.container)}>
      {inline ? (
        <Center>
          <hr
            {...styles.hline}
            {...colorScheme.set('borderColor', 'divider')}
          />
          {series.overview?.meta?.path ? (
            <Link href={series.overview.meta.path} passHref>
              <a {...styles.plainlink}>
                <h3 {...styles.title}>{series.title}</h3>
              </a>
            </Link>
          ) : (
            <h3 {...styles.title}>{series.title}</h3>
          )}
          <p {...styles.description}>{series.description}</p>
        </Center>
      ) : null}

      <TeaserCarousel grid={!inline} isSeriesNav>
        <TeaserCarouselTileContainer
          initialScrollTileIndex={currentTileIndex}
          isSeriesNav
          overflowCentered
        >
          {episodes.map(episode => {
            return (
              <SeriesNavTile
                key={episode.title}
                PayNote={PayNote && episode.isPayNote && PayNote}
                current={documentId && documentId === episode?.document?.id}
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

      {inline ? (
        {PayNote ? (
          <ColorContextLocalExtension localColors={localColors}>
            <PayNote inline={inline} />
          </ColorContextLocalExtension>
        ) : (
          <hr
            {...styles.hline}
            {...colorScheme.set('borderColor', 'divider')}
          />
        )}
      ) : null}
    </div>
  )
}

SeriesNav.propTypes = {
  documentId: PropTypes.string.isRequired,
  series: PropTypes.object.isRequired,
  ActionBar: PropTypes.func.isRequired,
  Link: PropTypes.func.isRequired,
  PayNote: PropTypes.func,
  inline: PropTypes.bool,
  height: PropTypes.number,
  onEpisodeClick: PropTypes.func
}

export default SeriesNav
