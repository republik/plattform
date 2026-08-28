import { PageBlock } from '@/app/(sanity)/[...path]/components/page-block'
import { EditLink } from '@/app/(sanity)/components/edit-link'
import { EditorialImage } from '@/app/(sanity)/components/portable-text/editorial-image'
import { hasContent } from '@/app/(sanity)/components/portable-text/helpers/hasContent'
import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { Theme } from '@/app/(sanity)/components/theme'
import type { PageDocumentType } from '@/app/(sanity)/groq/document-query'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import { editorialContent } from '@republik/theme/recipes'
import Link from 'next/link'

export default async function PageDocument({
  page,
}: {
  page: PageDocumentType
}) {
  const { _id, title, description, cover, heading, theme, pageBuilder } = page

  return (
    <EventTrackingContext category='Page'>
      <Theme theme={theme} />

      <div
        // Puts the whole app in dark mode (see the `dark` condition in preset-republik.ts).
        data-force-theme={theme?.darkMode ? 'dark' : undefined}
        className={editorialContent({
          theme: theme?.name,
        })}
      >
        {cover && <EditorialImage value={cover} />}

        {heading && (
          <p className='page-heading'>
            <Link href={heading.slug}>
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
          <EditLink documentId={_id} documentType='page' />
        </div>

        {(pageBuilder ?? []).map((block) => (
          <PageBlock key={block._key} block={block} documentId={_id} />
        ))}
      </div>
    </EventTrackingContext>
  )
}
