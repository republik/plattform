import { EditLink } from '@/app/(sanity)/components/edit-link'
import { EditorialImage } from '@/app/(sanity)/components/portable-text/editorial-image'
import { hasContent } from '@/app/(sanity)/components/portable-text/helpers/hasContent'
import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { Theme } from '@/app/(sanity)/components/theme'
import { PAGE_QUERY } from '@/app/(sanity)/groq/page-query'
import { SEO_QUERY } from '@/app/(sanity)/groq/seo-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { urlFor } from '@/app/(sanity)/lib/urlFor'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import { editorialContent } from '@republik/theme/recipes'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Block } from './components/block'

// Metadata: stega disabled to keep invisible characters out of <title>
export async function generateMetadata({
  params,
}: PageProps<'/pages/[...path]'>): Promise<Metadata> {
  const { path } = await params
  const slug = `/${path.join('/')}`

  const { data } = await sanityFetch({
    query: SEO_QUERY,
    params: { slug },
    stega: false,
  })

  if (!data) {
    return { title: 'Seite nicht gefunden' }
  }

  let images = null

  try {
    if (data.useImageBuilder) {
      // Rendered "Share Image" (old style) generated on the fly by /api/og.
      images = {
        url: new URL(
          `/api/og?slug=${encodeURIComponent(slug)}`,
          process.env.NEXT_PUBLIC_BASE_URL,
        ).toString(),
        width: 1200,
        height: 630,
      }
    } else if (data.image) {
      // Static social image: point directly at the Sanity CDN crop.
      images = {
        url: urlFor(data.image).width(1200).height(630).url(),
        width: 1200,
        height: 630,
      }
    }
  } catch (error) {
    console.error('Error generating image URL:', error)
  }

  return {
    title: data.title,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data?.description,
      url: new URL(slug, process.env.NEXT_PUBLIC_BASE_URL),
      images,
    },
  }
}

// Page component: default settings (stega active in Draft Mode)
export default async function PostPage({
  params,
}: PageProps<'/pages/[...path]'>) {
  const { path } = await params
  const slug = `/${path.join('/')}`

  const { data: page } = await sanityFetch({
    query: PAGE_QUERY,
    params: { slug },
  })

  if (!page) notFound()

  const { _id, title, description, cover, heading, theme, pageBuilder } = page

  return (
    <EventTrackingContext category='Page'>
      <Theme theme={theme} />

      <div
        className={editorialContent({
          theme: theme?.name,
        })}
      >
        {cover && <EditorialImage value={cover} />}

        {heading && (
          <p className='page-heading'>
            <Link href={`/pages${heading.slug}`}>
              <InlinePortableText value={heading.title} />
            </Link>
          </p>
        )}

        <h1 className='page-title'>
          <InlinePortableText value={title} />
        </h1>

        {hasContent(description) && (
          <p className='page-lead'>
            <InlinePortableText value={description} />
          </p>
        )}

        <div className={css({ display: 'grid', placeContent: 'center' })}>
          <EditLink _id={_id} documentType='page' />
        </div>

        {(pageBuilder ?? []).map((block) => (
          <Block key={block._key} block={block} documentId={_id} />
        ))}
      </div>
    </EventTrackingContext>
  )
}
