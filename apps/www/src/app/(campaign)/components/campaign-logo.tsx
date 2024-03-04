import Image from 'next/image'

import illustration from '@app/app/(campaign)/assets/campaign-illustration.svg'
import illustrationInverted from '@app/app/(campaign)/assets/campaign-illustration-inverted.svg'

export const CampaignLogo = ({
  className,
  inverted = false,
}: {
  className?: string
  inverted?: boolean
}) => {
  return (
    <Image
      className={className}
      alt='Kampagnen-Logo'
      src={inverted ? illustrationInverted : illustration}
    />
  )
}
