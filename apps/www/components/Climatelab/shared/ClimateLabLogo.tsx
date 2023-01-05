import Image from 'next/image'
import { useTranslation } from '../../../lib/withT'
import { CLIMATE_LAB_IMG_URL } from '../constants'

type ClimateLabLogoProps = {
  width: number
  height: number
  hideFigcaption?: boolean
}

const ClimateLabLogo = ({
  width,
  height,
  hideFigcaption = false,
}: ClimateLabLogoProps) => {
  const { t } = useTranslation()

  return (
    <figure style={{ position: 'relative', margin: 0 }}>
      <Image
        src={CLIMATE_LAB_IMG_URL}
        width={width}
        height={height}
        alt={t('Climate/Logo/altText')}
        unoptimized
      />
      {!hideFigcaption && (
        <figcaption
          style={{
            position: 'absolute',
            bottom: '-0.75rem',
            right: '15%',
            fontSize: '0.75rem',
          }}
        >
          Cristina Spanò
        </figcaption>
      )}
    </figure>
  )
}

export default ClimateLabLogo
