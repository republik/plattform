import { PageLayout } from '@/app/components/layout'
import { css } from '@republik/theme/css'

export default async function SucheLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <PageLayout>
      {/* `editorial` = 695px, matching the article grid's text column width. */}
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
