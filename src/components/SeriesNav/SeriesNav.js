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
import { serifBold16, serifRegular14 } from '../Typography/styles'
import { Breakout } from '../../components/Center'

const DEFAULT_PAYNOTE_INDEX = 2

const styles = {
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

function SeriesNav({ document, inline, height, ActionBar, Link, PayNote }) {
  const [colorScheme] = useColorContext()
  console.log('styleguide', document)
  if (!document.meta.series) {
    return <div>No Series Object</div>
  }

  const currentTile = document.meta.series.episodes.filter(
    episode => episode.document && episode.document?.id === document.id
  )[0]

  console.log(currentTile)
  // add paynote object after current episode or to third card if no current episode
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
        <Breakout>
          <hr
            {...styles.hline}
            {...colorScheme.set('borderColor', 'divider')}
          />
          <h3 {...styles.title}>{document.meta.series.title}</h3>
          <p {...styles.description}>{document.meta.series.description}</p>
        </Breakout>
      ) : null}

      <TeaserCarousel
        grid={!inline}
        style={{ padding: 0, backgroundColor: 'transparent' }}
      >
        <TeaserCarouselTileContainer
          height={height}
          initialScrollTile={currentTile && currentTile.document.id}
          style={{ padding: 0 }}
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
