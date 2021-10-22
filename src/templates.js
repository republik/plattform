// Export article-schema
export { default as createArticleSchema } from './templates/Article'
export { extractImages, matchImagesParagraph } from './templates/Article/utils'

// Export comment-schema
export { default as createCommentWebSchema } from './templates/Comment/web'
export { default as createCommentEmailSchema } from './templates/Comment/email'

// Export dossier-schema
export { default as createDossierSchema } from './templates/Dossier'

// Export discussion-schema
export { default as createDiscussionSchema } from './templates/Discussion'

// Export editorial-newsletter-schema
export { default as createNewsletterWebSchema } from './templates/EditorialNewsletter/web'
export { default as createNewsletterEmailSchema } from './templates/EditorialNewsletter/email'

// Export format-schema
export { default as createFormatSchema } from './templates/Format'

// Export front-schema
export { default as createFrontSchema } from './templates/Front'

// Export page-schema
export { default as createPageSchema } from './templates/Page'

// Export section-schema
export { default as createSectionSchema } from './templates/Section'

// Export Teaser components
export { TeaserActiveDebates } from './components/TeaserActiveDebates'
export { TeaserMyMagazine } from './components/TeaserMyMagazine'
