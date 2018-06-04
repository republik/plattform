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

const comments = {
  color: 'column name',
  colorSort: '`"none"`, `"ascending"`, `"descending"`',
  columnSort: '`"none"`, `"ascending"`, `"descending"`',
  sort: '`"none"`, `"ascending"`, `"descending"`',
  colorRange: 'custom `["#d62728", "#9467bd"]`\nand named `"discrete"`, `"sequential3"`, `"diverging1"`, `"diverging1n"`, `"diverging2"`, `"diverging3"`',
  timeParse: 'see [d3-time-format](https://github.com/d3/d3-time-format)',
  timeFormat: 'see [d3-time-format](https://github.com/d3/d3-time-format)',
  xTicks: 'e.g. `[2005, 2010, 2015]`'
}
const manualType = {
  colorRange: 'array, string',
  xTicks: 'array'
}

const options = propByName.map(({ key, values }) => ({
  Name: key,
  Type: values.map(d => d.type).filter(Boolean).filter(deduplicate).join(', ') || manualType[key],
  Charts: values.map(d => d.chart).join(', '),
  Comment: comments[key]
}))

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
