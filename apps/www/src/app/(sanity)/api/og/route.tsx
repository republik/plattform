import { SEO_QUERY } from '@/app/(sanity)/groq/seo-query'
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

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')

  if (!slug) {
    return new Response('Missing slug', { status: 400 })
  }

  // Published content only — no draft mode. Disable stega so invisible editing
  // characters don't end up baked into the rendered text.
  const data = await client.fetch(SEO_QUERY, { slug }, { stega: false })

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
        'cache-control':
          'public, immutable, no-transform, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  )
}
