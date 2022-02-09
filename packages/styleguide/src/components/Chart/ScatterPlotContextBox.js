import React from 'react'
import { ascending } from 'd3-array'
import ContextBox, {
  ContextBoxValue,
  mergeFragments,
  formatLines,
} from './ContextBox'
import { replaceKeys } from '../../lib/translate'

const Box = ({
  width,
  height,
  xFormat,
  yFormat,
  hover,
  hoverTouch,
  tooltipLabel,
  tooltipBody,
  label,
  yShowValue,
  xShowValue,
  sizeShowValue,
  detail,
  yUnit,
  xUnit,
  sizeUnit,
  sizeFormat,
}) => {
  if (!hover.length) {
    return null
  }

  const { cx, cy, r } = hover.sort((a, b) => ascending(a.cy, b.cy))[0]
  const top = hoverTouch || cy > height / 3
  const yOffset = r + (hoverTouch ? 40 : 12)

  return (
    <ContextBox
      orientation={top ? 'top' : 'below'}
      x={cx}
      y={cy + (top ? -yOffset : yOffset)}
      contextWidth={width}
    >
      {hover.map(({ value }, i) => {
        const replacements = {
          ...value.datum,
          y: value.y,
          x: value.x,
          size: value.size,
          formattedY: yFormat(value.y),
          formattedX: xFormat(value.x),
          formattedSize: sizeFormat(value.size),
        }
        const contextT = (text) => replaceKeys(text, replacements)
        return (
          <ContextBoxValue
            key={`${value.datum[label]}${i}`}
            label={tooltipLabel ? contextT(tooltipLabel) : value.datum[label]}
          >
            {mergeFragments(
              tooltipBody
                ? formatLines(contextT(tooltipBody))
                : [
                    value.datum[detail],
                    yShowValue && `${replacements.formattedY} ${yUnit}`,
                    xShowValue && `${replacements.formattedX} ${xUnit}`,
                    sizeShowValue &&
                      `${replacements.formattedSize} ${sizeUnit}`,
                  ]
                    .filter(Boolean)
                    .map(formatLines),
            )}
          </ContextBoxValue>
        )
      })}
    </ContextBox>
  )
}

export default Box
