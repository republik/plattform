import { PageLayout } from '@/app/components/layout'
import CampaignBanner from '@/app/kampagne/components/campaign-banner'
import { css } from '@republik/theme/css'

export const revalidate = 60

export default async function SanityFrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <PageLayout>
      <CampaignBanner />
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
