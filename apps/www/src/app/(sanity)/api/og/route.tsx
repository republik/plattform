import { OG_SHARE_IMAGE_QUERY } from '@/app/(sanity)/groq/seo-query'
import { client } from '@/app/(sanity)/lib/client'
import { urlFor } from '@/app/(sanity)/lib/urlFor'
import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'
import { loadShareImageFonts } from '../../components/share-image/fonts'
import {
  SHARE_IMAGE_HEIGHT,
  SHARE_IMAGE_WIDTH,
  ShareImage,
} from '../../components/share-image/share-image'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  const documentId = req.nextUrl.searchParams.get('documentId')

  if (!slug && !documentId) {
    return new Response('Missing slug or documentId', { status: 400 })
  }

  // Published-only lookup, by slug (or documentId for a just-published
  // article whose slug might not be indexed yet). Studio's own SEO preview
  // renders this same component via satori client-side instead of calling
  // this route — see the studio repo's shareImagePreview/renderShareImage.ts
  // — so this route only ever needs to serve the public og:image.
  const data = await client.fetch(
    OG_SHARE_IMAGE_QUERY,
    { slug: slug ?? null, id: documentId ?? null },
    { stega: false },
  )

  if (!data) {
    return new Response('Not found', { status: 404 })
  }

  const builder = data.imageBuilder
  const theme = data.theme

  const backgroundImageUrl =
    builder?.layout === 'BACKGROUND_IMAGE' && builder?.backgroundImage
      ? urlFor(builder.backgroundImage)
          .width(SHARE_IMAGE_WIDTH)
          .height(SHARE_IMAGE_HEIGHT)
          .fit('crop')
          .url()
      : null

  const logoUrl =
    builder?.layout === 'LOGO' && builder?.logo
      ? urlFor(builder.logo).height(520).url()
      : null

  const fonts = await loadShareImageFonts()

  const cacheControl =
    process.env.NODE_ENV === 'development'
      ? 'no-store'
      : 'public, immutable, no-transform, max-age=300, s-maxage=3600, stale-while-revalidate=86400'

  return new ImageResponse(
    (
      <ShareImage
        text={builder?.text}
        fontSize={builder?.fontSize}
        textPosition={builder?.textPosition}
        inverted={builder?.inverted}
        layout={builder?.layout}
        themeName={theme?.name}
        accentColor={theme?.accentColor?.hex}
        heading={data.heading}
        backgroundImageUrl={backgroundImageUrl}
        logoUrl={logoUrl}
      />
    ),
    {
      width: SHARE_IMAGE_WIDTH,
      height: SHARE_IMAGE_HEIGHT,
      fonts: fonts.map((font) => ({
        name: font.name,
        data: font.data,
        weight: font.weight,
        style: font.style,
      })),
      headers: {
        'cache-control': cacheControl,
      },
    },
  )
}
