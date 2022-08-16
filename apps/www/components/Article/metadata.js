import { SHARE_IMAGE_HEIGHT, SHARE_IMAGE_WIDTH } from '@project-r/styleguide'

import {
  ASSETS_SERVER_BASE_URL,
  PUBLIC_BASE_URL,
  SCHEMA_PUBLISHER,
} from '../../lib/constants'
import { parseJSONObject } from '../../lib/safeJSON'
import { deduplicate } from '../../lib/utils/helpers'

const publisher = parseJSONObject(SCHEMA_PUBLISHER)

export const runMetaFromQuery = (code, query) => {
  if (!code) {
    return undefined
  }
  let fn
  try {
    /* eslint-disable-next-line */
    fn = new Function('query', code)
    return fn(query)
  } catch (e) {
    typeof console !== 'undefined' &&
      console.warn &&
      console.warn('meta.fromQuery exploded', e)
  }
  return undefined
}

const mapContributor = ({ user, name }) => ({
  '@type': 'Person',
  name,
  url: user?.username ? `${PUBLIC_BASE_URL}/~${user.username}` : undefined,
  sameAs: user
    ? [
        user.publicUrl,
        user.twitterHandle && `https://twitter.com/${user.twitterHandle}`,
        user.facebookId && `https://www.facebook.com/${user.facebookId}`,
      ].filter(Boolean)
    : undefined,
})

const getJSONLDs = (meta) => {
  if (meta.template === 'article') {
    const headline = meta.seoTitle || meta.twitterTitle || meta.title
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': meta.url,
        },
        headline,
        description:
          meta.seoDescription || meta.twitterDescription || meta.description,
        alternativeHeadline: headline !== meta.title ? meta.title : undefined,
        image: [meta.image, meta.twitterImage, meta.facebookImage]
          .filter(Boolean)
          .filter(deduplicate),
        datePublished: meta.publishDate,
        dateModified: meta.lastPublishedAt,
        author: meta.contributors
          .filter((c) => c.kind?.includes('Text'))
          .map(mapContributor),
        contributor: meta.contributors
          .filter((c) => !c.kind?.includes('Text'))
          .map(mapContributor),
        publisher: publisher.name && publisher, // skip empty objects or if name is missing
      },
    ]
  }
}

function getCitationMetaData(meta) {
  const authors = meta.contributors
    .filter((contributor) => contributor?.kind?.includes('Text'))
    .map((contributor) => {
      const parts = contributor.name.split(' ')
      // Convert the name into the following format `Surname, Given Name(s)`
      return `${parts[parts.length - 1]}, ${parts
        .slice(0, parts.length - 1)
        .join(' ')}`
    })
    .join('; ')

  return {
    citation_title: meta.title,
    citation_journal_title: PUBLIC_BASE_URL,
    citation_date: meta.publishDate,
    citation_authors: authors,
  }
}

export const getMetaData = (documentId, meta) => {
  const shareImage =
    meta.shareText &&
    `${ASSETS_SERVER_BASE_URL}/render?width=${SHARE_IMAGE_WIDTH}&height=${SHARE_IMAGE_HEIGHT}&updatedAt=${encodeURIComponent(
      `${documentId}${meta.format ? `-${meta.format.id}` : ''}`,
    )}&url=${encodeURIComponent(
      `${PUBLIC_BASE_URL}${meta.path}?extract=share`,
    )}`

  const metaWithUrls = {
    ...meta,
    facebookImage: shareImage || meta.facebookImage,
    twitterImage: shareImage || meta.twitterImage,
    url: `${PUBLIC_BASE_URL}${meta.path}`,
  }

  return {
    ...metaWithUrls,
    jsonLds: getJSONLDs(metaWithUrls),
    citationMeta: getCitationMetaData(meta),
  }
}
