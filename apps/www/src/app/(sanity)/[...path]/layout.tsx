import { FontSizeStyle } from '@/app/components/font-size-style'
import { FontSizeSync } from '@/app/components/font-size-sync'
import { PageLayout } from '@/app/components/layout'
import { css } from '@republik/theme/css'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <PageLayout>
      <FontSizeStyle />
      <FontSizeSync />
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
