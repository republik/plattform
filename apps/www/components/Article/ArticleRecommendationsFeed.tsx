import React, { useMemo } from 'react'
import { Center, Interaction, fontStyles } from '@project-r/styleguide'
import { useArticleRecommendationsQuery } from './graphql/getArticleRecommendations.graphql'
import { css } from 'glamor'
import Loader from '../Loader'
import DocumentList from '../Feed/DocumentList'
import { useTranslation } from '../../lib/withT'

const styles = {
  heading: css({
    marginBottom: 15,
    ...fontStyles.sansSerifMedium16,
  }),
}

type ArticleSuggestionsFeedProps = {
  path: string
}

const ArticleRecommendationsFeed = ({ path }: ArticleSuggestionsFeedProps) => {
  const { t } = useTranslation()
  const { data, loading } = useArticleRecommendationsQuery({
    variables: {
      path,
    },
  })

  const articleRecommendations = useMemo(() => {
    if (!data || !data.article || !data.article.meta.recommendations) {
      return []
    }
    return data.article.meta.recommendations.nodes
  }, [data])

  const amountOfPodcastsInRecommendations = useMemo(() => {
    return articleRecommendations
      ? articleRecommendations.filter(
          (recommendation) => !!recommendation.meta?.audioSource,
        ).length
      : 0
  }, [data])

  return (
    <Center>
      <Loader
        loading={loading}
        render={() => (
          <>
            {data.article.meta.recommendations?.nodes.length > 0 && (
              <>
                <Interaction.P {...styles.heading}>
                  {articleRecommendations.length -
                    amountOfPodcastsInRecommendations ==
                  articleRecommendations.length
                    ? t('articleRecommendations/article-recommendations')
                    : articleRecommendations.length -
                        amountOfPodcastsInRecommendations >
                      0
                    ? t(
                        'articleRecommendations/article-and-podcast-recommendations',
                      )
                    : t('articleRecommendations/podcast-recommendations')}
                </Interaction.P>
                <DocumentList
                  documents={data.article.meta.recommendations.nodes}
                  feedProps={{
                    showHeader: false,
                  }}
                />
              </>
            )}
          </>
        )}
      />
    </Center>
  )
}

export default ArticleRecommendationsFeed
