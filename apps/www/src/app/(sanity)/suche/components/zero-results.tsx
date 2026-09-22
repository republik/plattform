'use client'

import { css } from '@republik/theme/css'
import { useTranslation } from '@/lib/withT'

const containerStyle = css({
  margin: '40px 0 100px',
  fontSize: 16,
  md: { fontSize: 18 },
})

export function ZeroResults() {
  const { t } = useTranslation()
  return (
    <div
      className={containerStyle}
      dangerouslySetInnerHTML={{ __html: t('search/results/empty') }}
    />
  )
}
