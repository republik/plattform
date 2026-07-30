import { PageLayout } from '@/app/components/layout'
import { css } from '@republik/theme/css'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <PageLayout>
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
