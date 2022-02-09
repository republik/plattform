import React from 'react'
import { subsup } from './utils'
import { useColorContext } from '../Colors/ColorContext'
import { css } from 'glamor'
import { sansSerifMedium12, sansSerifRegular12 } from '../Typography/styles'

const styles = {
  inlineLabel: css({
    ...sansSerifMedium12,
  }),
  inlineSecondaryLabel: css({
    ...sansSerifRegular12,
  }),
}

export const InlineLabel = ({
  symbol,
  inlineLabel,
  inlineSecondaryLabel,
  inlineLabelPosition,
}) => {
  const [colorScheme] = useColorContext()
  const { datum } = symbol.value
  const primary = datum[inlineLabel]
  const secondary = datum[inlineSecondaryLabel]
  const pos = datum[inlineLabelPosition] || 'center'
  let textAnchor = 'middle'
  let yOffset = 0
  let xOffset = 0
  if (pos === 'left') {
    textAnchor = 'end'
    xOffset = -(symbol.r + 5)
  }
  if (pos === 'right') {
    textAnchor = 'start'
    xOffset = symbol.r + 5
  }
  if (pos === 'top' || pos === 'bottom') {
    yOffset = symbol.r + 5 + (primary && secondary ? 15 : 7)
    if (pos === 'top') {
      yOffset = -yOffset
    }
  }

  return (
    <g
      textAnchor={textAnchor}
      transform={`translate(${symbol.cx + xOffset},${symbol.cy + yOffset})`}
    >
      {primary && (
        <text
          {...styles.inlineLabel}
          {...colorScheme.set('fill', 'text')}
          dy={secondary ? '-0.3em' : '0.4em'}
        >
          {subsup.svg(primary)}
        </text>
      )}
      {secondary && (
        <text
          {...styles.inlineSecondaryLabel}
          {...colorScheme.set('fill', 'text')}
          dy={primary ? '0.9em' : '0.4em'}
        >
          {subsup.svg(secondary)}
        </text>
      )}
    </g>
  )
}
