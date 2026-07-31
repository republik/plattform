import { PageLayout } from '@/app/components/layout'
import { css } from '@republik/theme/css'

export default async function SanityFrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <PageLayout>
      <div
        className={css({
          color: 'text',
          position: 'relative',
        })}
      >
        {children}
      </div>
    </PageLayout>
  )
}
