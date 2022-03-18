import React, { useMemo } from 'react'
import { Center, Interaction } from '@project-r/styleguide'
import { useArticleRecommendationsQuery } from './graphql/getArticleRecommendations.graphql'
import { css } from 'glamor'
import Loader from '../Loader'
import DocumentList from '../Feed/DocumentList'

const styles = {
  heading: css({
    marginBottom: 15,
  }),
}

type ArticleSuggestionsFeedProps = {
  path: string
}

const ArticleRecommendationsFeed = ({ path }: ArticleSuggestionsFeedProps) => {
  const { data, loading } = useArticleRecommendationsQuery({
    variables: {
      path,
    },
  })

  const containsTextArticles = useMemo(() => {
    return false
  }, [data])

  const containsPodcasts = useMemo(() => {
    return false
  }, [data])

  return (
    <Center>
      <Loader
        loading={loading}
        render={() => (
          <>
            {data.article.meta.recommendations?.nodes.length > 0 && (
              <>
                <Interaction.H3 {...styles.heading}>
                  Lesen Sie auch:
                </Interaction.H3>
                <DocumentList
                  documents={data.article.meta.recommendations.nodes}
                  feedProps={{
                    showHeader: false,
                  }}
                />
              </>
            )}
            {data && (
              <details>
                <summary>Raw data</summary>
                <div>
                  <pre {...css({ overflowX: 'hidden' })}>
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              </details>
            )}
          </>
        )}
      />
    </Center>
  )
}

export default ArticleRecommendationsFeed
