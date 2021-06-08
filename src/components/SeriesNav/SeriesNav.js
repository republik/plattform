import React from 'react'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import PropTypes from 'prop-types'
import {
  TeaserCarousel,
  TeaserCarouselTileContainer
} from '../../components/TeaserCarousel'
import SeriesNavTile from './SeriesNavTile'
import { useColorContext } from '../Colors/useColorContext'
import { ColorContextLocalExtension } from '../Colors/ColorContext'
import { serifBold16, serifRegular14 } from '../Typography/styles'
import Center from '../../components/Center'

const DEFAULT_PAYNOTE_INDEX = 2

const styles = {
  container: css({
    maxWidth: 1120,
    margin: '0 auto',
    padding: '0 15px',
    [mUp]: {
      padding: '0 30px'
    }
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
    ...serifBold16,
    marginBottom: 4
  }),
  description: css({
    ...serifRegular14,
    margin: 0,
    marginBottom: 30
  })
}

function SeriesNav({
  documentId,
  series,
  inline,
  height,
  ActionBar,
  Link,
  PayNote,
  onEpisodeClick
}) {
  const [colorScheme] = useColorContext()
  if (!series) {
    return <div>No Series Object</div>
  }

  const currentTile = series.episodes.filter(
    episode => episode.document && episode.document?.id === documentId
  )[0]

  const currentTileIndex = series.episodes.findIndex(
    episode =>
      episode.document && episode.document.id === currentTile.document.id
  )

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
  const payNote = { isPayNote: true }
  const episodes =
    PayNote && !inline
      ? [
          ...series.episodes.slice(
            0,
            currentTile
              ? Math.max(currentTileIndex + 1, DEFAULT_PAYNOTE_INDEX)
              : DEFAULT_PAYNOTE_INDEX
          ),
          payNote,
          ...series.episodes.slice(
            currentTile
              ? Math.max(currentTileIndex + 1, DEFAULT_PAYNOTE_INDEX)
              : DEFAULT_PAYNOTE_INDEX
          )
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
          <h3 {...styles.title}>{series.title}</h3>
          <p {...styles.description}>{series.description}</p>
        </Center>
      ) : null}

      <TeaserCarousel
        grid={!inline}
        style={{
          padding: 0,
          backgroundColor: 'transparent'
        }}
      >
        <TeaserCarouselTileContainer
          height={height}
          initialScrollTileIndex={currentTileIndex}
          style={{
            padding: 0
          }}
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
        <ColorContextLocalExtension localColors={localColors}>
          {PayNote ? (
            <PayNote inline={inline} />
          ) : (
            <hr
              {...styles.hline}
              {...colorScheme.set('borderColor', 'divider')}
            />
          )}
        </ColorContextLocalExtension>
      ) : null}
    </div>
  )
}

const WrappedSeriesNav = props => <SeriesNav {...props} />

SeriesNav.propTypes = {
  documentId: PropTypes.string.isRequired,
  series: PropTypes.object.isRequired,
  ActionBar: PropTypes.func.isRequired,
  Link: PropTypes.func.isRequired,
  PayNote: PropTypes.func,
  inline: PropTypes.bool,
  height: PropTypes.number
}

export default WrappedSeriesNav

WrappedSeriesNav.data = {
  config: {
    options: ({ data }) => ({
      variables: {
        doucumentPath: data.document
      },
      ssr: false
    }),
    props: ({ data }) => {
      return {
        data: {
          loading: data.loading,
          error: data.error,
          document: data.document
        }
      }
    }
  },
  query: ` 
  query getDocument($documentPath: String!) {
    document (path: $documentPath) { 
      id
      meta {
        series {
          title
          logo
          episodes {
            title
            label
            image
            publishDate
            document {
              id
            }
          }
        }
      }
    } 
  }
  `
}
