import Container from '@/app/components/container'
import { PageLayout } from '@/app/components/layout'
import { css } from '@republik/theme/css'

export default async function SucheLayout({
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
          pt: '4',
        })}
      >
        <Container>{children}</Container>
      </div>
    </PageLayout>
  )
}
