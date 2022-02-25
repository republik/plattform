import React from 'react'
import { css } from 'glamor'

import { formatLocale } from 'd3-format'
import { arc } from 'd3-shape'
import { partition } from 'd3-hierarchy'
import { ascending, descending } from 'd3-array'

import { groupped, total, colors } from './data'

import { fontFamilies } from '@project-r/styleguide'

const nbspNumbers = formatLocale({
  decimal: ',',
  thousands: '\u00a0',
  grouping: [3],
  currency: ['CHF\u00a0', ''],
})
const percentFormat = nbspNumbers.format('.1%')

const styles = {
  container: css({
    position: 'relative',
    height: 0,
    width: '100%',
    paddingBottom: '100%',
  }),
  svg: css({
    fontFamily: fontFamilies.sansSerifRegular,
    position: 'absolute',
    height: '100%',
    width: '100%',
    left: 0,
    top: 0,
  }),
}

export const radius = 250
const layout = partition().size([2 * Math.PI, radius * radius])

const startAngle = (d) => d.x0
const endAngle = (d) => d.x1

const arcGenerator = arc()
  .startAngle(startAngle)
  .endAngle(endAngle)
  .innerRadius((d) => Math.sqrt(d.y0))
  .outerRadius((d) => Math.sqrt(d.y1))

const visSort = {
  Geldgeber: 2,
  Gründerteam: 1,
  'Eigenaktien Republik': 3,
  'Project R Gen': 4,
}

const grouppedVis = groupped
  .copy()
  .sort(
    (a, b) =>
      ascending(visSort[a.data.Kategorie], visSort[b.data.Kategorie]) ||
      descending(a.value, b.value),
  )

const legend = []
  .concat(groupped.children)
  .sort((a, b) => descending(a.value, b.value))

const arcs = layout(grouppedVis)
  .descendants()
  .filter((d) => d.data.Kategorie)

const computeTextRotation = (d) => {
  const centerRadians = startAngle(d) + (endAngle(d) - startAngle(d)) / 2
  const degree = centerRadians * (180 / Math.PI) - 90

  return degree > 85 ? degree + 180 : degree
}

export default () => (
  <div {...styles.container}>
    <svg
      viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
      width='100%'
      {...styles.svg}
    >
      {arcs.map((d, i) => (
        <path
          key={i}
          d={arcGenerator(d)}
          fill={colors[d.data.Kategorie]}
          stroke='#fff'
        />
      ))}
      {arcs
        .filter((d) => d.depth === 1 || d.value / total > 0.01)
        .map((d, i) => {
          const centroid = arcGenerator.centroid(d)
          const rotate = computeTextRotation(d)

          const transform = `translate(${centroid}) rotate(${rotate})`
          return [
            <text
              key={`text${i}`}
              dy='.35em'
              fill='#fff'
              textAnchor='middle'
              fontSize={12}
              transform={transform}
            >
              {percentFormat(d.value / total)}
            </text>,
          ]
        })}
      <g transform={`translate(-65, -45)`}>
        {legend.map((group, i) => (
          <g key={`legend${i}`} transform={`translate(0, ${i * 20})`}>
            <rect width={15} height={15} fill={colors[group.data.Kategorie]} />
            <text
              x={20}
              dy='.8em'
              fill={colors[group.data.Kategorie]}
              style={{ fontFamilty: fontFamilies.sansSerifMedium }}
            >
              {group.data.Kategorie}
            </text>
          </g>
        ))}
      </g>
    </svg>
  </div>
)
