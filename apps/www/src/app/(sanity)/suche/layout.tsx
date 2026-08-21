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
        {/* Narrower than the generic Container (52rem/832px): the old
        search page used styleguide's Center at its regular (non-breakout)
        width -- MAX_WIDTH 665px + 15px padding each side -- and search
        results read better at that width than the wider list-page one. */}
        <div
          className={css({
            mx: 'auto',
            px: '4',
            maxWidth: '695px',
            width: 'full',
          })}
        >
          {children}
        </div>
      </div>
    </PageLayout>
  )
}
