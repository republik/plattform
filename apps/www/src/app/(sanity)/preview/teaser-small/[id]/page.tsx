import { CarouselTeaser } from '@/app/(sanity)/components/teaser/carousel'
import FeedTeaser from '@/app/(sanity)/components/teaser/feed'
import GridTeaser from '@/app/(sanity)/components/teaser/grid'
import { InlineTeaser } from '@/app/(sanity)/components/teaser/inline'
import { TEASER_SMALL_PREVIEW_QUERY } from '@/app/(sanity)/groq/teaser-small-preview-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { css } from '@republik/theme/css'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  robots: {
    index: false,
  },
}

const section = css({
  my: '12',
})

const sectionTitle = css({
  textStyle: 'sansSerifRegular',
  fontSize: '22px',
  mb: '4',
  pb: '2',
  borderBottomWidth: 1,
  borderBottomStyle: 'solid',
  borderBottomColor: 'divider',
})

// Breaks out of the page's max-width column so there's actually enough
// overflow for the row to scroll — the production carousel gets this for
// free from the page grid's "full" column, which this simple preview page
// doesn't have.
const carouselBreakout = css({
  width: '100vw',
  marginInline: 'calc(50% - 50vw)',
})

const carousel = css({
  display: 'flex',
  overflowX: 'scroll',
  scrollSnapType: 'x mandatory',
  px: '4',
  pb: '8',
})

// Mirrors series-menu-bar.tsx's episode grid.
const gridStyle = css({
  display: 'grid',
  gridTemplateColumns: '1fr',
  md: { gridTemplateColumns: 'repeat(2, 1fr)' },
  lg: { gridTemplateColumns: 'repeat(3, 1fr)' },
  columnGap: '4',
  rowGap: '12',
})

// Mirrors series-nav.tsx's inline episode scroller.
const inlineScroll = css({
  overflowX: 'scroll',
  overflowY: 'hidden',
  scrollSnapType: 'x mandatory',
  display: 'inline-grid',
  gridAutoFlow: 'column',
  gridAutoColumns: 'min(170px, 80vw)',
  gap: '4',
  px: '4',
  pb: '8',
})

const placeholderNote = css({
  mb: '6',
  fontSize: 's',
  fontStyle: 'italic',
  color: 'textSoft',
})

export default async function TeaserSmallPreviewPage({
  params,
}: PageProps<'/preview/teaser-small/[id]'>) {
  const { id } = await params

  const { data: teaser } = await sanityFetch({
    query: TEASER_SMALL_PREVIEW_QUERY,
    params: { id },
  })

  if (!teaser) notFound()

  return (
    <div className={css({ maxWidth: '640px', mx: 'auto', px: '4', py: '8' })}>
      <h1 className={css({ textStyle: 'sansSerifRegular', fontSize: '30px' })}>
        Kompakter Teaser – Vorschau
      </h1>

      <section className={section}>
        <h2 className={sectionTitle}>Feed</h2>
        <FeedTeaser teaser={teaser} />
      </section>

      <section className={section}>
        <h2 className={sectionTitle}>Karussell</h2>
        <div className={carouselBreakout}>
          <div className={carousel}>
            {[0, 1, 2].map((i) => (
              <CarouselTeaser key={i} teaser={teaser} />
            ))}
          </div>
        </div>
      </section>

      <section className={section}>
        <h2 className={sectionTitle}>Serien-Übersicht (Grid)</h2>
        <p className={placeholderNote}>
          Platzhalter: wird nur innerhalb einer Serie gezeigt, mit allen echten
          Episoden nebeneinander – hier zur Veranschaulichung mit diesem Teaser
          dreifach dupliziert.
        </p>
        <div className={gridStyle}>
          {[0, 1, 2].map((i) => (
            <GridTeaser key={i} teaser={teaser} isCurrentArticle={i === 1} />
          ))}
        </div>
      </section>

      <section className={section}>
        <h2 className={sectionTitle}>Serien-Übersicht (Inline)</h2>
        <p className={placeholderNote}>
          Platzhalter: wird nur innerhalb einer Serie gezeigt, mit allen echten
          Episoden nebeneinander – hier zur Veranschaulichung mit diesem Teaser
          dreifach dupliziert.
        </p>
        <div className={carouselBreakout}>
          <div className={inlineScroll}>
            {[0, 1, 2].map((i) => (
              <InlineTeaser key={i} teaser={teaser} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
