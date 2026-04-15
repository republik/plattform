import { css } from '@republik/theme/css'

import { usePaynotes } from '@app/components/paynotes/paynotes-context'

import { useTranslation } from 'lib/withT'
import { IconClose } from '@republik/icons'
import { useState } from 'react'

export function WelcomeBanner() {
  const { t } = useTranslation()
  const { paynoteKind } = usePaynotes()
  const [isVisible, setIsVisible] = useState(true)

  if (paynoteKind !== 'WELCOME_BANNER') {
    return null
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      data-theme='light'
      className={css({
        background: 'background.marketing',
        color: 'text',
      })}
    >
      <div
        className={css({
          //maxWidth: 'narrow',
          padding: '4',
          margin: '0 auto',
          lineHeight: '1.4',
          display: 'flex',
          gap: '2',
          md: {
            alignItems: 'center',
          },
        })}
      >
        <div className={css({ flex: 0, pt: '2', md: { pt: '0' } })}>
          <svg
            width='19'
            height='18'
            viewBox='0 0 19 18'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M16.92 16.512L18.192 17.352V18H12.336L8.784 10.272L7.248 11.592V15.936L7.536 16.56L9.408 17.376V18H0.72V17.376L2.352 16.56L2.64 15.936V3.024L2.352 2.4L0.72 1.584V0.959999H10.368C13.92 0.959999 15.912 2.544 15.912 5.016C15.912 7.704 13.824 9.216 10.416 9.576V9.888L13.776 10.44L16.92 16.512ZM7.248 3.528V9H8.232C9.768 9 11.232 7.944 11.232 5.52C11.232 3.24 9.984 2.256 8.688 2.088L7.248 3.528Z'
              fill='#FF7667'
            />
          </svg>
        </div>
        {t('paynotes/welcomeBanner')}
        <div className={css({ marginLeft: 'auto', cursor: 'pointer' })}>
          <IconClose size={24} onClick={() => setIsVisible(false)} />
        </div>
      </div>
    </div>
  )
}
