import { EditLink } from '@/app/(sanity)/components/edit-link'
import { EditorialImage } from '@/app/(sanity)/components/portable-text/editorial-image'
import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { Theme } from '@/app/(sanity)/components/theme'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { urlFor } from '@/app/(sanity)/lib/urlFor'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import { editorialContent } from '@republik/theme/recipes'
import { Metadata } from 'next'
import { defineQuery } from 'next-sanity'
import { notFound } from 'next/navigation'
import { PageBuilder } from './components/page-builder'

const PAGE_SEO_QUERY = defineQuery(
  `*[_type == "page" && slug.current == $slug][0]{
    "title": coalesce(seo.title, pt::text(title)),
    "description": coalesce(seo.description, pt::text(description)),
    "image": coalesce(seo.image, image)
  }`,
)

// Metadata: stega disabled to keep invisible characters out of <title>
export async function generateMetadata({
  params,
}: PageProps<'/pages/[...path]'>): Promise<Metadata> {
  const { path } = await params
  const slug = `/${path.join('/')}`

  const { data } = await sanityFetch({
    query: PAGE_SEO_QUERY,
    params: { slug },
    stega: false,
  })

  if (!data) {
    return { title: 'Seite nicht gefunden' }
  }

  const images = data.image?.asset
    ? {
        url: urlFor(data.image?.asset).width(1200).height(630).url(),
        width: 1200,
        height: 630,
      }
    : null

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

const PAGE_QUERY = defineQuery(
  `*[_type == "page" && slug.current == $slug][0]{
    _id,
    title,
    cover {
      ...
    },
    useCoverAsTitle,
    heading->{
      _id,
      title,
      "slug": slug.current
    },
    theme {
      darkMode,
      accentColor
    },
    pageBuilder[]{
      _key,
      _type,
      appearance
    }
  }`,
)

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

  const { _id, title, cover, heading, useCoverAsTitle, theme, pageBuilder } =
    page

  return (
    <EventTrackingContext category='Page'>
      <Theme theme={theme} />

      <div className={editorialContent({ theme: 'page' })}>
        {cover && <EditorialImage value={cover} />}

        {!useCoverAsTitle && (
          <>
            {heading && (
              <p
                className={css({
                  mb: '-6',
                  mt: '8',
                  textAlign: 'center',
                  gridColumn: 'breakout',
                })}
                style={{ color: 'var(--page-theme-accent-color)' }}
              >
                <InlinePortableText value={heading.title} />
              </p>
            )}

            <h1
              className={css({
                mt: '12',
                textAlign: 'center',
                gridColumn: 'breakout',
              })}
            >
              <InlinePortableText value={title} />
            </h1>

            <div
              className={css({
                mt: '8',
                position: 'absolute',
                top: 110,
                right: 30,
              })}
            >
              <EditLink _id={_id} documentType='page' />
            </div>
          </>
        )}

        <PageBuilder blocks={pageBuilder} documentId={_id} />
      </div>
    </EventTrackingContext>
  )
}
