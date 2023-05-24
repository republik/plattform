import Head from 'next/head'

import {
  imageSizeInfo,
  imageResizeUrl,
} from '@republik/mdast-react-render/lib/utils'

import { CDN_FRONTEND_BASE_URL } from '../../lib/constants'
import withT from '../../lib/withT'

const Meta = ({ data, t }) => {
  const {
    // Default props
    url,
    pageTitle,
    title,
    description,
    image,

    // SEO props
    seoTitle,
    seoDescription,

    // Twitter props
    twitterTitle,
    twitterDescription,
    twitterImage,

    // Facebook props
    facebookTitle,
    facebookDescription,
    facebookImage,

    // Linked data props
    jsonLds,

    // Citation meta data
    // based on https://www.zotero.org/support/dev/exposing_metadata
    citationMeta,
  } = data

  const metaTitle =
    (seoTitle && t('components/Frame/Meta/title', { title: seoTitle })) ||
    (twitterTitle &&
      t('components/Frame/Meta/title', { title: twitterTitle })) ||
    pageTitle ||
    (title && t('components/Frame/Meta/title', { title }))

  // to prevent facebook from using a random image from the website we fall back to a square avatar and claim it's below 315px in size to trigger the small image layout
  // - https://developers.facebook.com/docs/sharing/webmasters/images/?locale=en_US
  const ogImage =
    facebookImage ||
    image ||
    `${CDN_FRONTEND_BASE_URL}/static/avatar310.png?size=310x310`

  const twitterCard = twitterImage || image

  const { width: ogImageWidth, height: ogImageHeight } =
    (ogImage && imageSizeInfo(ogImage)) || {}

  return (
    <Head>
      <title>{metaTitle}</title>
      <meta
        name='description'
        content={seoDescription || twitterDescription || description}
      />

      <meta property='og:type' content='website' />
      {url && <meta property='og:url' content={url} />}
      {url && <link rel='canonical' href={url} />}
      <meta property='og:title' content={facebookTitle || title} />
      <meta
        property='og:description'
        content={facebookDescription || description}
      />
      {!!ogImage && <meta property='og:image' content={ogImage} />}
      {!!ogImageWidth && (
        <meta property='og:image:width' content={ogImageWidth} />
      )}
      {!!ogImageHeight && (
        <meta property='og:image:height' content={ogImageHeight} />
      )}

      <meta name='twitter:site' content='@RepublikMagazin' />
      <meta name='twitter:creator' content='@RepublikMagazin' />
      <meta name='twitter:title' content={twitterTitle || title} />
      <meta
        name='twitter:description'
        content={twitterDescription || description}
      />
      <meta
        name='twitter:card'
        content={twitterCard ? 'summary_large_image' : 'summary'}
      />
      {!!twitterCard && (
        <meta
          name='twitter:image:src'
          content={imageResizeUrl(twitterCard, '3000x')}
        />
      )}
      {citationMeta &&
        Object.entries(citationMeta)
          .filter(([_, value]) => !!value)
          .map(([key, value]) => <meta key={key} name={key} content={value} />)}

      {jsonLds?.map((jsonLd, index) => (
        <script
          key={index}
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ))}
    </Head>
  )
}

export default withT(Meta)
