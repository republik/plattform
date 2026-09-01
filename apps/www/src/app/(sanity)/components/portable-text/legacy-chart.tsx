'use client'
import { ContentErrorBoundary } from '@/app/(sanity)/components/content-error-boundary'
import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import type { ArticlePortableTextBlockType } from '@/app/(sanity)/groq/portable-text-content-fragment'
import type { Chart as ChartT } from '@/sanity.types'
import { Chart } from '@project-r/styleguide'
import { css, cva } from '@republik/theme/css'
import { csvParse } from 'd3-dsv'

const containerStyle = cva({
  base: {},
  variants: {
    size: {
      FLOAT_TINY: {},
      NARROW: {},
      NORMAL: {},
      BREAKOUT: {
        gridColumn: 'breakout',
      },
      FULL: {
        gridColumn: 'full',
      },
    },
  },
})

export function LegacyChart({
  value,
}: {
  value: Extract<ArticlePortableTextBlockType, { _type: 'chart' }>
}) {
  const { size, chartConfig } = value

  const values = csvParse(chartConfig.data?.code ?? '')
  const config = JSON.parse(chartConfig.settings?.code ?? '{}')
  return (
    <div className={containerStyle({ size })}>
      <h3 className={css({ textStyle: 'h2Sans' })}>
        <InlinePortableText value={value.title} />
      </h3>
      <p className={css({ textStyle: 'body', fontSize: 'l', mb: '4' })}>
        <InlinePortableText value={value.description} />
      </p>
      <ContentErrorBoundary title='Diese Grafik kann wegen eines Fehlers nicht dargestellt werden.'>
        <Chart config={config} values={values} />
      </ContentErrorBoundary>
    </div>
  )
}
