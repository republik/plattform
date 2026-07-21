'use client'
import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
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

export function LegacyChart({ value }: { value: ChartT }) {
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

      <Chart config={config} values={values} />
    </div>
  )
}
