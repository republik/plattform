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

const DEFAULT_PAYNOTE_INDEX = 2

const styles = {
  hline: css({
    borderWidth: 0,
    borderTopWidth: 1,
    borderStyle: 'solid',
    margin: '15px 0',
    [mUp]: {
      display: 'none'
    }
  })
}

function SeriesNav({ document, inline, height, ActionBar, Link, PayNote }) {
  const [colorScheme] = useColorContext()

  // case if no document.id is present
  const currentTile = document.meta.series.episodes.filter(
    episode => episode?.document.id === document?.id
  )[0]

  const payNote = { isPayNote: true }

  const episodes =
    PayNote && !inline
      ? [
          ...document.meta.series.episodes.slice(
            0,
            currentTile ? currentTile.document.id : DEFAULT_PAYNOTE_INDEX
          ),
          payNote,
          ...document.meta.series.episodes.slice(
            currentTile ? currentTile.document.id : DEFAULT_PAYNOTE_INDEX
          )
        ]
      : [...document.meta.series.episodes]

  return (
    <>
      {inline ? (
        <>
          <hr
            {...styles.hline}
            {...colorScheme.set('borderColor', 'divider')}
          />
          <h2>{document.meta.series.title}</h2>
          <p>{document.meta.series.description}</p>
        </>
      ) : null}

      <TeaserCarousel grid={!inline}>
        <TeaserCarouselTileContainer
          height={height}
          initialScrollTile={currentTile?.document?.id}
        >
          {episodes.map(episode => {
            return (
              <SeriesNavTile
                key={episode.title}
                PayNote={episode.isPayNote && PayNote}
                current={document?.id === episode?.document?.id}
                episode={episode}
                inline={inline}
                ActionBar={ActionBar}
                Link={Link}
              />
            )
          })}
        </TeaserCarouselTileContainer>
      </TeaserCarousel>

      {inline ? (
        <>
          <hr
            {...styles.hline}
            {...colorScheme.set('borderColor', 'divider')}
          />
          {PayNote && <PayNote />}
        </>
      ) : null}
    </>
  )
}

const WrappedSeriesNav = props => <SeriesNav {...props} />

SeriesNav.propTypes = {
  document: PropTypes.object.isRequired,
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
