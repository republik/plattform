import { EditLink } from '@/app/(sanity)/components/edit-link'
import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { Theme } from '@/app/(sanity)/components/theme'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import { editorialContent } from '@republik/theme/recipes'
import { Metadata } from 'next'
import { defineQuery } from 'next-sanity'
import { notFound } from 'next/navigation'
import { PageContent } from './components/page-content'
import { urlFor } from '@/app/(sanity)/lib/urlFor'

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
    description,
    byline,
    theme {
      darkMode,
      accentColor
    },
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

  return (
    <EventTrackingContext category='Article'>
      <Theme theme={page.theme} />
      <article className={editorialContent()}>
        {/* TITLE BLOCK */}
        <h1
          className={css({
            textStyle: 'editorialTitle',
            mt: '12',
          })}
        >
          <InlinePortableText value={page.title} />
        </h1>
        <h3 className={css({ textStyle: 'editorialLead', mt: '4' })}>
          <InlinePortableText value={page.description} />
        </h3>
        <p
          className={css({
            textStyle: 'editorialByline',
            mt: '4',
            '& a': { textDecoration: 'underline' },
          })}
        >
          <InlinePortableText value={page.byline} />
        </p>

        <div className={css({ mt: '4' })}>
          <EditLink _id={page._id} />
        </div>

        <PageContent slug={slug} />
      </article>
    </EventTrackingContext>
  )
}
