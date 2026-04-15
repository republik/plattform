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
  wrapper: css({
    marginTop: 44,
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

  return (
    <Loader
      loading={loading}
      render={() => (
        <>
          {data?.article?.meta?.recommendations?.nodes.length > 0 && (
            <Center>
              <section {...styles.wrapper}>
                <Interaction.P {...styles.heading}>
                  {t('articleRecommendations/heading')}
                </Interaction.P>
                <DocumentList
                  documents={data.article.meta.recommendations.nodes}
                  feedProps={{
                    showHeader: false,
                  }}
                />
              </section>
            </Center>
          )}
        </>
      )}
    />
  )
}

export default ArticleRecommendationsFeed
