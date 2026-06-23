import { PageLayout } from '@/app/components/layout'
import { css } from '@republik/theme/css'

export default async function ArticlePageLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <PageLayout showDraftModeIndicator={false}>
      <div
        className={css({
          color: 'text',
          pb: '16-32',
        })}
      >
        {children}
      </div>
    </PageLayout>
  )
}
