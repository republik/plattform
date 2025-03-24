import React from 'react'
import { Center, Interaction, fontStyles } from '@project-r/styleguide'
import { css } from 'glamor'
import Loader from '../Loader'
import DocumentList from '../Feed/DocumentList'
import { useTranslation } from '../../lib/withT'
import { useQuery } from '@apollo/client'
import { ArticleRecommendationsDocument } from '#graphql/republik-api/__generated__/gql/graphql'

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
  const { data, loading } = useQuery(ArticleRecommendationsDocument, {
    variables: {
      path,
    },
  })

  return (
    <Loader
      loading={loading}
      render={() => {
        const documents = data?.article?.meta?.recommendations?.nodes
        return (
          <>
            {documents.length > 0 && (
              <Center>
                <section {...styles.wrapper}>
                  <Interaction.P {...styles.heading}>
                    {t('articleRecommendations/heading')}
                  </Interaction.P>
                  <DocumentList
                    documents={documents}
                    feedProps={{
                      showHeader: false,
                    }}
                  />
                </section>
              </Center>
            )}
          </>
        )
      }}
    />
  )
}

export default ArticleRecommendationsFeed
