import type { ArticleDocumentType } from '@/app/(sanity)/groq/document-query'

export type Article = ArticleDocumentType

export type ArticleNewsletter = NonNullable<Article['newsletter']>

export type ArticleCollection = NonNullable<Article['articleCollection']>

export type ArticleRecommendation = NonNullable<
  Article['articleRecommendations']
>[number]

export type ArticleContributor = NonNullable<Article['contributors']>[number]

export type ArticleThemeType = NonNullable<Article['theme']>
