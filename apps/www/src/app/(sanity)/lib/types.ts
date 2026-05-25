import type { ARTICLE_QUERY_RESULT } from '../../../../sanity/__generated__/types'

export type Article = NonNullable<ARTICLE_QUERY_RESULT>

export type ArticleNewsletter = NonNullable<Article['newsletter']>

export type ArticleCollection = NonNullable<Article['articleCollection']>

export type ArticleRecommendation = NonNullable<
  Article['articleRecommendations']
>[number]

export type ArticleContributor = NonNullable<Article['contributors']>[number]
