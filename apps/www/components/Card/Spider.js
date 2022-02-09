import React from 'react'
import { range, max } from 'd3-array'
import { color } from 'd3-color'
import { fontStyles, useColorContext } from '@project-r/styleguide'

const maxDomain = 100
const radians = 2 * Math.PI
const levels = 2

function getHorizontalPosition(i, range, factor = 1) {
  return range * (1 - factor * Math.sin((-i * radians) / nAxes))
}
function getVerticalPosition(i, range, factor = 1) {
  return range * (1 - factor * Math.cos((-i * radians) / nAxes))
}

const base = 22.5
export const axes = [
  { rot: 0, text: 'Offene\nAussenpolitik' },
  { rot: base * 2, text: 'Liberale\nWirtschaftspolitik' },
  { rot: base * 4, text: 'Restriktive\nFinanzpolitik' },
  { rot: -base * 2, text: 'Law & Order\n' },
  { rot: 0, text: 'Restriktive\nMigrationspolitik' },
  { rot: base * 2, text: 'Ausgebauter\nUmweltschutz' },
  { rot: -base * 4, text: 'Ausgebauter\nSozialstaat' },
  { rot: -base * 2, text: 'Liberale\nGesellschaft' },
]
const nAxes = axes.length

const Spider = ({
  data,
  fill,
  fillOpacity = 0.7,
  size,
  reference,
  label = true,
}) => {
  const [colorScheme] = useColorContext()

  const cx = size / 2
  const cy = size / 2
  const factor = label ? 0.75 : 0.95

  const points = data.map((d, i) => {
    return {
      x: getHorizontalPosition(i, cx, (d / maxDomain) * factor),
      y: getVerticalPosition(i, cy, (d / maxDomain) * factor),
      value: d,
    }
  })

  const maxValue = max(data)
  const maxDiff =
    reference &&
    max(reference.map((d, i) => (d < 0 ? 0 : Math.abs(d - data[i]))))

  const radius = factor * Math.min(cx, cy)
  const levelFactors = range(0, levels).map((level) => {
    return radius * ((level + 1) / levels)
  })

  return (
    <svg width={size} height={size}>
      {levelFactors.map((levelFactor) => (
        <g key={levelFactor}>
          {range(0, nAxes).map((i) => (
            <line
              key={i}
              {...colorScheme.set('stroke', 'text')}
              strokeOpacity={0.17}
              strokeWidth='1'
              x1={getHorizontalPosition(i, levelFactor)}
              y1={getVerticalPosition(i, levelFactor)}
              x2={getHorizontalPosition(i + 1, levelFactor)}
              y2={getVerticalPosition(i + 1, levelFactor)}
              transform={`translate(${cx - levelFactor} ${cy - levelFactor})`}
            />
          ))}
        </g>
      ))}
      {axes.map((_, i) => (
        <line
          key={`axis-${i}`}
          {...colorScheme.set('stroke', 'text')}
          strokeOpacity={0.17}
          strokeWidth='1'
          x1={cx}
          y1={cy}
          x2={getHorizontalPosition(i, cx, factor)}
          y2={getVerticalPosition(i, cy, factor)}
        />
      ))}
      {label &&
        axes.map(({ text, rot }, i) => {
          const below = i > 2 && i < 6
          const highlight =
            maxDiff !== undefined
              ? Math.abs(data[i] - reference[i]) === maxDiff
              : data[i] === maxValue

          const x = getHorizontalPosition(i, cx, factor)
          const y = getVerticalPosition(i, cx, factor)

          return (
            <g
              key={`labels-${i}`}
              transform={`translate(${x} ${y}) rotate(${rot})`}
            >
              <text
                {...colorScheme.set('fill', 'text')}
                style={{
                  ...fontStyles[highlight ? 'sansSerifMedium' : 'sansSerif'],
                  fontSize: highlight ? 11 : 10,
                }}
                textAnchor='middle'
              >
                {text.split('\n').map((line, i, all) => (
                  <tspan
                    key={i}
                    x='0'
                    y={
                      below
                        ? `${1.1 * (i + 1)}em`
                        : `-${0.5 + 1.1 * (all.length - i - 1)}em`
                    }
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          )
        })}
      <polygon
        opacity={fillOpacity}
        fill={fill}
        stroke={fill}
        strokeWidth='1'
        points={points
          .map((p) => {
            return [p.x, p.y].join(',')
          })
          .join(' ')}
      />
      {reference && (
        <g>
          {reference.map((d, i) => {
            const nd = i === nAxes - 1 ? reference[0] : reference[i + 1]
            if (d < 0 && nd < 0) {
              return null
            }

            const p =
              d < 0
                ? [
                    getHorizontalPosition(
                      i + 0.9,
                      cx,
                      (nd / maxDomain) * factor,
                    ),
                    getVerticalPosition(i + 0.9, cy, (nd / maxDomain) * factor),
                  ]
                : [
                    getHorizontalPosition(i, cx, (d / maxDomain) * factor),
                    getVerticalPosition(i, cy, (d / maxDomain) * factor),
                  ]

            const np =
              nd < 0
                ? [
                    getHorizontalPosition(
                      i + 0.1,
                      cx,
                      (d / maxDomain) * factor,
                    ),
                    getVerticalPosition(i + 0.1, cy, (d / maxDomain) * factor),
                  ]
                : [
                    getHorizontalPosition(i + 1, cx, (nd / maxDomain) * factor),
                    getVerticalPosition(i + 1, cy, (nd / maxDomain) * factor),
                  ]

            return (
              <line
                key={i}
                {...colorScheme.set('stroke', 'text')}
                strokeWidth='1'
                x1={p[0]}
                y1={p[1]}
                x2={np[0]}
                y2={np[1]}
              />
            )
          })}
        </g>
      )}
      {label &&
        points.map(({ value, x, y }, i) => {
          if (maxDiff === undefined && value !== maxValue) {
            return null
          }
          const diff = reference && value - reference[i]
          if (maxDiff !== undefined && Math.abs(diff) !== maxDiff) {
            return null
          }
          const below = i > 2 && i < 6
          const { rot } = axes[i]

          return (
            <g
              key={`max-${i}`}
              transform={`translate(${x} ${y}) rotate(${rot})`}
            >
              <text
                style={{
                  ...fontStyles.sansSerifMedium,
                  fontSize: 11,
                }}
                fill={color(fill).darker(1.5)}
                textAnchor='middle'
                dy={
                  below
                    ? value > 92
                      ? '0em'
                      : '0.8em'
                    : value > 92
                    ? '0.8em'
                    : '0em'
                }
              >
                {reference
                  ? diff > 0
                    ? `+${Math.round(diff)}`
                    : !!diff && Math.round(diff)
                  : Math.round(value)}
              </text>
            </g>
          )
        })}
    </svg>
  )
}

export default Spider
