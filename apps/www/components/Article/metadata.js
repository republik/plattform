import { SHARE_IMAGE_HEIGHT, SHARE_IMAGE_WIDTH } from '@project-r/styleguide'

import {
  ASSETS_SERVER_BASE_URL,
  CDN_FRONTEND_BASE_URL,
  PUBLIC_BASE_URL,
} from '../../lib/constants'

import { deduplicate } from '../../lib/utils/helpers'

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
          .filter((c) => c.kind === 'Text')
          .map(mapContributor),
        contributor: meta.contributors
          .filter((c) => c.kind !== 'Text')
          .map(mapContributor),
        publisher: {
          '@type': 'NewsMediaOrganization',
          name: 'Republik',
          email: 'kontakt@republik.ch',
          telephone: '+41 44 505 67 80',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Sihlhallenstrasse 1',
            postalCode: '8004',
            addressLocality: 'Zürich',
            addressCountry: 'CH',
          },
          sameAs: [
            'https://twitter.com/RepublikMagazin',
            'https://www.facebook.com/RepublikMagazin',
            'https://www.instagram.com/republikmagazin/',
          ],
          masthead: `${PUBLIC_BASE_URL}/impressum`,
          ownershipFundingInfo: `${PUBLIC_BASE_URL}/aktionariat`,
          logo: {
            '@type': 'ImageObject',
            url: `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
            width: 1200,
            height: 628,
          },
        },
      },
    ]
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
  }
}
