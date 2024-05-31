import Image from 'next/image'

import illustration from '@app/app/(campaign)/assets/campaign-illustration.svg'
import illustrationInverted from '@app/app/(campaign)/assets/campaign-illustration-inverted.svg'
import illustrationBlack from '@app/app/(campaign)/assets/campaign-illustration-bw.svg'

type Variant = 'red' | 'red-inverted' | 'black'

const VARIANTS: Record<Variant, any> = {
  red: illustration,
  'red-inverted': illustrationInverted,
  black: illustrationBlack,
}

export const CampaignLogo = ({
  className,
  variant = 'red',
}: {
  className?: string
  variant?: Variant
}) => {
  return (
    <Image className={className} alt='Kampagnen-Logo' src={VARIANTS[variant]} />
  )
}
