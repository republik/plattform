import Head from 'next/head'

import { imageResizeUrl, imageSizeInfo } from '@republik/mdast-react-render'

import { SHARE_IMAGE_WIDTH } from '@project-r/styleguide'
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

  // We resize the OG image to a width of 1200px, so we need to infer the height
  const ogImageSize = ogImage && imageSizeInfo(ogImage)
  const resizedOgImageSize = ogImageSize
    ? {
        width: SHARE_IMAGE_WIDTH,
        height: Math.round(
          (SHARE_IMAGE_WIDTH / ogImageSize.width) * ogImageSize.height,
        ),
      }
    : // If the original image size is not known, we cannot know the height
      { width: SHARE_IMAGE_WIDTH }

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
      {!!ogImage && (
        <meta property='og:image' content={imageResizeUrl(ogImage, '1200x')} />
      )}
      {!!resizedOgImageSize.width && (
        <meta property='og:image:width' content={resizedOgImageSize.width} />
      )}
      {!!resizedOgImageSize.height && (
        <meta property='og:image:height' content={resizedOgImageSize.height} />
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
          content={imageResizeUrl(twitterCard, '1200x')}
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
