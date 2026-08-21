import { PageLayout } from '@/app/components/layout'
import { css } from '@republik/theme/css'

export default async function SucheLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <PageLayout>
      {/* `editorial` is the same width the article-rendering grid recipe
      (packages/theme/src/recipes/editorial-content.ts) uses for its
      non-breakout text column -- 695px, matching where most article
      content already lives, so search results read at the same width. */}
      <div
        className={css({
          color: 'text',
          pb: '16-32',
          pt: '4',
          mx: 'auto',
          px: '4',
          maxWidth: 'editorial',
          width: 'full',
        })}
      >
        {children}
      </div>
    </PageLayout>
  )
}
