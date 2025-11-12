import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'

import { IconArrowRight } from '@republik/icons'
import { css } from '@republik/theme/css'

import { postMessage, useInNativeApp } from 'lib/withInNativeApp'
import { useTranslation } from 'lib/withT'
import Link from 'next/link'

const nativeCtaStyle = css({
  textStyle: 'body',
  fontSize: 'base',
  textAlign: 'center',
  fontWeight: 'medium',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2',
})

function Arrow() {
  return (
    <IconArrowRight
      size={'1.2em'}
      className={css({
        display: 'inline-block',
        verticalAlign: 'middle',
      })}
    />
  )
}

function NativeCta() {
  const { t } = useTranslation()
  const { isMinimalNativeAppVersion } = useInNativeApp()
  const { isIOSApp, isAndroidApp } = usePlatformInformation()
  const canUseIOSLinkCta = isIOSApp && isMinimalNativeAppVersion('2.3.0')

  if (canUseIOSLinkCta) {
    return (
      <div className={nativeCtaStyle}>
        <p>
          {t.elements('paynotes/native/cta', {
            link: (
              <Link
                key='link'
                className={css({ textDecoration: 'underline' })}
                href={process.env.NEXT_PUBLIC_SHOP_BASE_URL}
                onClick={(e) => {
                  e.preventDefault()
                  postMessage({
                    type: 'external-link',
                  })
                }}
              >
                shop.republik.ch
              </Link>
            ),
          })}
        </p>
        <Arrow />
      </div>
    )
  }

  return (
    <div className={nativeCtaStyle}>
      {isIOSApp && <p>{t('paynotes/ios/text')}</p>}
      {isAndroidApp && <p>{t('paynotes/android/text')}</p>}
    </div>
  )
}

export default NativeCta
