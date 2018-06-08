import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { TableSpecimen, markdown } from 'catalog'
import { ReactCharts } from './'
import { descending, ascending } from 'd3-array'

import {
  sortPropType,
  groupBy,
  deduplicate
} from './utils'

const propTypeNames = new Map()
Object.keys(PropTypes).forEach(key => {
  propTypeNames.set(PropTypes[key], key)
  propTypeNames.set(PropTypes[key].isRequired, key)
})
propTypeNames.set(sortPropType, 'string')

const isSubType = Component => Component.base || Component.extends

const charts = Object.keys(ReactCharts)
const baseCharts = charts
  .filter(key => !isSubType(ReactCharts[key]))
  .filter(key => ReactCharts[key].propTypes)

const props = baseCharts.reduce(
  (all, chart) => {
    const propTypes = ReactCharts[chart].propTypes
    const props = Object.keys(propTypes).map(key => ({
      key,
      type: propTypeNames.get(propTypes[key]),
      chart
    }))

    return all.concat(props)
  },
  []
)

const IGNORE_KEYS = [
  // for react usage only
  't', 'children', 'values', 'width', 'colorRanges',
  // should not really be used
  'mini', 'description', 'filter'
]

const propByName = groupBy(props, d => d.key)
  .filter(group => IGNORE_KEYS.indexOf(group.key) === -1)
  .sort((a, b) => descending(a.values.length, b.values.length) || ascending(a.key, b.key))

const examples = {
  color: '`"category"`',
  colorLegend: '`true`',
  colorRange: '`["#d62728", "#9467bd"]`',
  numberFormat: '`".2%"`',
  xTicks: '`[2005, 2010, 2015]`',
  colorSort: '`"none"`',
  category: '`"datum.country === \'CH\' ? \'CH\' : \'andere\'"`',
  column: '`"category"`',
  columnSort: '`"none"`',
  columnFilter: '`[{"title": "CH", "test": "datum.country === \'CH\'"}, {"title": "Andere", "test": "datum.country !== \'CH\'"}]`',
  columns: '`3`',
  confidence: '`95`',
  domain: '`[2005, 2015]`',
  height: '`300`'
}
const comments = {
  color: 'column name',
  colorSort: 'see `"sort"`',
  columnSort: '`see `"sort"`',
  sort: '`"none"`, `"ascending"`, `"descending"`',
  colorRange: 'or presets: `"discrete"`, `"sequential3"`, `"diverging1"`, `"diverging1n"`, `"diverging2"`, `"diverging3"`',
  colorLegend: 'force (`true`) or suppress (`false`) color legend, auto if not set',
  timeParse: 'see [d3-time-format](https://github.com/d3/d3-time-format#locale_format)',
  timeFormat: 'see [d3-time-format](https://github.com/d3/d3-time-format#locale_format)',
  numberFormat: 'see [d3-format](https://github.com/d3/d3-format#locale_format)',
  xTicks: 'same format as your x data',
  category: 'js expression, data row available as `datum`',
  columns: 'number of columns, normally 1 up to 4',
  domain: 'same format as your data',
  height: 'higher than 320 is usually bad on mobile'
}
const manualType = {
  colorRange: 'array, string',
  xTicks: 'array'
}

const options = propByName.map(({ key, values }) => ({
  Name: `\`"${key}":\``,
  Example: examples[key],
  Type: values.map(d => d.type).filter(Boolean).filter(deduplicate).join(', ') || manualType[key],
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


  return markdown`### ${key}

  ${label}

  ${<TableSpecimen rows={Object.keys(defaultProps).map(key => ({
    Name: key,
    Value: `\`${JSON.stringify(defaultProps[key])}\``
  }))} />}

  `
})

const allProps = markdown`
## All Props

${<TableSpecimen rows={options} />}

`

export default () => <Fragment>
  {allProps}
  {markdown`## Default Props`}
  {chartPages}
</Fragment>
