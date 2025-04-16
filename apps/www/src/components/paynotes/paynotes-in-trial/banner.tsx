import Link from 'next/link'

import { IconArrowRight } from '@republik/icons'

import { css } from '@republik/theme/css'

import { useTranslation } from 'lib/withT'
import { usePaynotes } from '@app/components/paynotes/paynotes-context'

export function BannerPaynote() {
  const { t } = useTranslation()
  const { paynoteKind } = usePaynotes()

  if (paynoteKind !== 'BANNER') {
    return null
  }

  return (
    <div
      data-theme='light'
      style={{
        // @ts-expect-error css vars
        '--bg': '#F2ECE6',
      }}
      className={css({
        background: 'var(--bg)',
        color: 'text',
      })}
    >
      <div
        className={css({
          maxWidth: '400px',
          px: '6',
          py: '4',
          margin: '0 auto',
        })}
      >
        <Link href={`${process.env.NEXT_PUBLIC_SHOP_BASE_URL}/angebot`}>
          <span
            className={css({
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            })}
          >
            {t('paynotes/banner/cta')}
            <IconArrowRight size={'1.2em'} />
          </span>
        </Link>
      </div>
    </div>
  )
}
