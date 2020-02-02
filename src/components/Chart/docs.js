import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { TableSpecimen, markdown } from '@catalog/core'
import { ReactCharts } from './'
import { descending, ascending } from 'd3-array'

import { sortPropType, groupBy, deduplicate } from './utils'

import { propTypes as barPropTypes } from './Bars'
import { propTypes as timeBarPropTypes } from './TimeBars'
import { propTypes as linePropTypes } from './Lines'
import { propTypes as scatterPlotPropTypes } from './ScatterPlots'
import { propTypes as genericMapPropTypes } from './Maps'

const propTypeNames = new Map()
Object.keys(PropTypes).forEach(key => {
  propTypeNames.set(PropTypes[key], key)
  propTypeNames.set(PropTypes[key].isRequired, key)
})
propTypeNames.set(sortPropType, 'string')

const baseChartPropTypes = {
  Bar: barPropTypes,
  TimeBar: timeBarPropTypes,
  Line: linePropTypes,
  ScatterPlot: scatterPlotPropTypes,
  GenericMap: genericMapPropTypes
}

const charts = Object.keys(ReactCharts)

const props = Object.keys(baseChartPropTypes).reduce((all, chart) => {
  const propTypes = baseChartPropTypes[chart]
  const props = Object.keys(propTypes).map(key => ({
    key,
    type: propTypeNames.get(propTypes[key]),
    chart
  }))

  return all.concat(props)
}, [])

const IGNORE_KEYS = [
  // for react usage only
  't',
  'children',
  'values',
  'width',
  'colorRanges',
  // should not really be used
  'mini',
  'description',
  'filter',
  // functions
  'getProjection'
]

const propByName = groupBy(props, d => d.key)
  .filter(group => IGNORE_KEYS.indexOf(group.key) === -1)
  .sort(
    (a, b) =>
      descending(a.values.length, b.values.length) || ascending(a.key, b.key)
  )

const examples = {
  color: '`"category"`',
  colorLegend: '`true`',
  colorRange: '`["#d62728", "#9467bd"]`',
  numberFormat: '`".2%"`',
  xTicks: '`[2005, 2010, 2015]`',
  colorSort: '`"none"`',
  category: "`\"datum.country === 'CH' ? 'CH' : 'andere'\"`",
  column: '`"category"`',
  columnSort: '`"none"`',
  columnFilter:
    '`[{"title": "CH", "test": "datum.country === \'CH\'"}, {"title": "Andere", "test": "datum.country !== \'CH\'"}]`',
  columns: '`3`',
  band: '`confidence95`',
  domain: '`[2005, 2015]`',
  height: '`300`',
  sizeRangeMax: '`20`'
}
const comments = {
  color: 'column name',
  colorSort: 'see `"sort"`',
  columnSort: '`see `"sort"`',
  sort: '`"none"`, `"ascending"`, `"descending"`',
  colorRange:
    'or presets: `"discrete"`, `"sequential3"`, `"diverging1"`, `"diverging1n"`, `"diverging2"`, `"diverging3"`',
  colorLegend:
    'force (`true`) or suppress (`false`) color legend, auto if not set',
  timeParse:
    'see [d3-time-format](https://github.com/d3/d3-time-format#locale_format)',
  timeFormat:
    'see [d3-time-format](https://github.com/d3/d3-time-format#locale_format)',
  numberFormat:
    'see [d3-format](https://github.com/d3/d3-format#locale_format)',
  xTicks: 'same format as your x data',
  xScale: '`"linear"`,  \nlines: `"ordinal"`, `"time"`,  \n scatter: `"log"`',
  category: 'js expression, data row available as `datum`',
  columns: 'number of columns, normally 1 up to 4',
  domain: 'same format as your data',
  height: 'higher than 320 is usually bad on mobile',
  sizeRangeMax: 'max radius plotted'
}
const manualType = {
  colorRange: 'array, string',
  xTicks: 'array'
}

const options = propByName.map(({ key, values }) => ({
  Name: `\`"${key}":\``,
  Example: examples[key],
  Type:
    values
      .map(d => d.type)
      .filter(Boolean)
      .filter(deduplicate)
      .join(', ') || manualType[key],
  Charts: values.map(d => d.chart).join(', '),
  Comment: comments[key]
}))

if (process.env.NODE_ENV === 'production') {
  options.forEach(option => {
    delete option.Type
  })
}

const chartPages = charts.map(key => {
  const { base, wrap, defaultProps } = ReactCharts[key]

  let label = 'Default props:'
  if (base) {
    label = `Based on ${base} with different default props:`
  } else if (wrap) {
    label = `Wraps ${wrap} with additional default props:`
  }

  const keys = Object.keys(defaultProps).filter(
    key => IGNORE_KEYS.indexOf(key) === -1
  )

  if (!keys.length) {
    return null
  }

  return markdown`### ${key}

  ${label}

  ${(
    <TableSpecimen
      rows={keys.map(key => ({
        Name: key,
        Value: `\`${JSON.stringify(defaultProps[key])}\``
      }))}
    />
  )}

  `
})

const allProps = markdown`
## All Props

${<TableSpecimen rows={options} />}

`

export default () => (
  <Fragment>
    {markdown`
~~~code|lang-jsx
import { Chart, ChartTitle, ChartLead } from '@project-r/styleguide/chart'
~~~

The charts are also available as simple, importable functions on [observablehq.com](https://observablehq.com/@republik/charts).

## Credits

This chart system for initially developed at Interactive Things for [«Gut leben in Deutschland»](https://github.com/gut-leben-in-deutschland/bericht). _License: [MIT](https://github.com/orbiting/styleguide/blob/master/src/components/Chart/LICENSE)_

It also incoperates color platte for Swiss parties created by [SRF Data](https://github.com/srfdata/swiss-party-colors). _License: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)_
    `}
    {allProps}
    {markdown`
## Default Props
    `}
    {chartPages}
  </Fragment>
)
