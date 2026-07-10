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
import { PageBuilder } from './components/page-builder'

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

  const {
    _id,
    title,
    description,
    cover,
    heading,
    useCoverAsTitle,
    theme,
    pageBuilder,
    skipTitleBlock,
  } = page

  const renderTitle = !useCoverAsTitle && !skipTitleBlock

  return (
    <EventTrackingContext category='Page'>
      <Theme theme={theme} />

      <div className={editorialContent({ theme: theme.name })}>
        {cover && <EditorialImage value={cover} />}

        {renderTitle && (
          <div
            className={css({
              my: '8',
              gridColumn: 'breakout',
            })}
            style={{
              textAlign: theme.name === 'EDITORIAL' ? 'left' : 'center',
            }}
          >
            {heading && (
              <p style={{ color: 'var(--page-theme-accent-color)' }}>
                <Link href={heading.slug}>
                  <InlinePortableText value={heading.title} />
                </Link>
              </p>
            )}

            <h1 className={css({ mt: '12' })}>
              <InlinePortableText value={title} />
            </h1>

            {hasContent(description) && (
              <h3 className={css({ mt: '4' })}>
                <InlinePortableText value={description} />
              </h3>
            )}

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
          </div>
        )}

        <PageBuilder blocks={pageBuilder} documentId={_id} />
      </div>
    </EventTrackingContext>
  )
}
