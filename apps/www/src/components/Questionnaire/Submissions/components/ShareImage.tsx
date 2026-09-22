import Head from 'next/head'
import { useSearchParams } from 'next/navigation'

import {
  fontStyles,
  SHARE_IMAGE_WIDTH,
  SHARE_IMAGE_HEIGHT,
} from '@project-r/styleguide'

type ShareImageProps = {
  text?: string
  img: string
  bgColor?: string
  fgColor?: string
}

export const ShareImage = ({
  text,
  img,
  bgColor,
  fgColor,
}: ShareImageProps) => {
  const searchParams = useSearchParams()
  if (!searchParams.get('extract')) {
    return null
  }

  if (!text) return null

  return (
    <>
      <Head>
        <meta name='robots' content='noindex' />
      </Head>

      <div
        style={{
          width: SHARE_IMAGE_WIDTH,
          height: SHARE_IMAGE_HEIGHT,
          display: 'grid',
          gridAutoColumns: '1fr',
          gridAutoFlow: 'column',
          backgroundColor: bgColor,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img src={img} width={SHARE_IMAGE_WIDTH / 2} />
        </div>
        <div
          style={{
            ...fontStyles.serifTitle,
            fontSize: text.length < 80 ? 48 : 42,
            lineHeight: 1.3,
            paddingRight: text.length > 100 ? 100 : 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: fgColor || 'inherit',
          }}
        >
          <span>{text}</span>
        </div>
      </div>
    </>
  )
}
