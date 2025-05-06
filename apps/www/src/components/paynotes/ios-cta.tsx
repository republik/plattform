import Link from 'next/link'

import { IconArrowRight } from '@republik/icons'
import { css } from '@republik/theme/css'

import { useInNativeApp, postMessage } from 'lib/withInNativeApp'
import { useTranslation } from 'lib/withT'

const iosCtaStyle = css({
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

function IosCTA() {
  const { t } = useTranslation()
  const { isMinimalNativeAppVersion } = useInNativeApp()
  const canUseLinkCta = isMinimalNativeAppVersion('2.3.0')

  if (canUseLinkCta) {
    return (
      <div className={iosCtaStyle}>
        <p>
          {t.elements('paynotes/ios/cta', {
            link: (
              <Link
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
    <div className={iosCtaStyle}>
      <Arrow />
      <p>{t('paynotes/ios/text')}</p>
    </div>
  )
}

export default IosCTA
