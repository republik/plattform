import React from 'react'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import {
  TeaserCarousel,
  TeaserCarouselTileContainer
} from '../../components/TeaserCarousel'
import SeriesNavTile from './SeriesNavTile'
import { useColorContext } from '../Colors/useColorContext'
import { plainButtonRule } from '../Button'

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

function SeriesNav({ document, inline, ActionBar, height }) {
  const [colorScheme] = useColorContext()

  const currentTile = document.meta.series.episodes.filter(
    episode => episode?.document.id === document?.id
  )[0]

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
          initialScrollTile={currentTile.document.id}
        >
          {document.meta.series.episodes.map(episode => (
            <SeriesNavTile
              key={episode.title}
              current={document?.id === episode?.document.id}
              episode={episode}
              inline={inline}
              ActionBar={ActionBar}
            />
          ))}
        </TeaserCarouselTileContainer>
      </TeaserCarousel>
      {inline ? (
        <hr {...styles.hline} {...colorScheme.set('borderColor', 'divider')} />
      ) : null}
    </>
  )
}

const WrappedSeriesNav = props => <SeriesNav {...props} />

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
