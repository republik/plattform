import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { css } from 'glamor'
import { scaleThreshold, scaleLinear } from 'd3-scale'
import { descending, ascending, extent } from 'd3-array'

import { useColorContext } from '../Colors/ColorContext'
import { getFormat, getTextColor, deduplicate } from './utils'
import { timeFormat, timeParse } from '../../lib/timeFormat'
import { defaultProps } from './ChartContext'
import { sansSerifRegular18 } from '../Typography/styles'
import { PADDING } from '../Center'
import { getColorMapper } from './colorMaps'
import { Collapsable } from '../Collapsable'
import { createTextGauger } from '../../lib/textGauger'
import { IconExpandLess, IconExpandMore } from '@republik/icons'

const labelGauger = createTextGauger(sansSerifRegular18, {
  dimension: 'width',
  html: true,
})

const styles = {
  container: css({
    overflowX: 'auto',
    overflowY: 'hidden',
    marginLeft: -PADDING,
    marginRight: -PADDING,
  }),
  table: css({
    ...sansSerifRegular18,
    lineHeight: '1.2',
    minWidth: '100%',
    borderSpacing: '0 2px',
    borderCollapse: 'separate',
    padding: `0 ${PADDING - 10}px`, // 10 cell padding on first and last cell in a row
  }),
  header: css({
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    padding: '8px 10px',
    userSelect: 'none',
  }),
  cell: css({
    padding: '8px 10px',
  }),
  cellNumeric: css({
    textAlign: 'right',
    fontFeatureSettings: '"tnum", "kern"',
  }),
}

const Table = (_props) => {
  const props = { ...defaultProps.Table, ..._props }
  const [colorScheme] = useColorContext()
  const {
    values,
    numberFormat,
    colorRanges,
    colorRange,
    defaultSortColumn,
    thresholds,
    tableColumns,
    collapsable,
    sortable,
    cellVerticalAlign,
    t,
  } = props

  const columns = values.columns || Object.keys(values[0] || {})
  const numberFormatter = getFormat(numberFormat, props.tLabel)
  const dateParser = timeParse(props.timeParse)
  const dateFormatter = timeFormat(props.timeFormat)

  const [sortBy, setSortBy] = useState({
    key: defaultSortColumn,
    order: 'desc',
  })

  const numberColumns = tableColumns
    .filter((d) => d.type === 'number')
    .map((d) => d.column)
  const numericColumns = numberColumns.concat(
    tableColumns.filter((d) => d.type === 'date').map((d) => d.column),
  )

  const dateColumns = tableColumns
    .filter((d) => d.type === 'date')
    .map((d) => d.column)

  const barColumns = tableColumns
    .filter((d) => d.type === 'bar')
    .map((d) => d.column)

  const parsedData =
    numberColumns.length || dateColumns.length
      ? values.map((row) => {
          let parsedRow = { ...row }
          numberColumns.forEach((key) => {
            if (parsedRow[key] !== undefined) {
              parsedRow[key] = +parsedRow[key]
            }
          })
          dateColumns.forEach((key) => {
            if (parsedRow[key] !== undefined) {
              parsedRow[key] = dateParser(parsedRow[key])
            }
          })
          return parsedRow
        })
      : [].concat(values)

  const barChartData = []
  if (barColumns.length) {
    values.map((row) => {
      barColumns.forEach((key) => {
        if (row[key] !== undefined) {
          row[key] = +row[key]
        }
        barChartData.push(row[key])
      })
    })
  }

  const barChartExtent = extent(barChartData)

  if (sortBy.key) {
    parsedData.sort((a, b) => {
      return sortBy.order === 'desc'
        ? descending(a[sortBy.key], b[sortBy.key])
        : ascending(a[sortBy.key], b[sortBy.key])
    })
  }

  // helper function that toggles order (desc/asc) or sets new sort by key (order: desc)
  const setSort = (key) => {
    if (sortBy.key === key) {
      setSortBy(
        sortBy.order === 'asc'
          ? {}
          : {
              key,
              order: sortBy.order === 'desc' ? 'asc' : 'desc',
            },
      )
    } else {
      setSortBy({ key, order: 'desc' })
    }
  }

  let colorScale

  if (thresholds) {
    colorScale = scaleThreshold()
      .domain(thresholds)
      .range(
        colorRanges[colorRange] ||
          colorRange ||
          colorRanges.sequential.slice(0, thresholds.length + 1),
      )
  } else {
    const colorColumns = tableColumns
      .filter((c) => c.color)
      .map((c) => c.column)
    const colorValues = !colorColumns.length
      ? []
      : parsedData
          .reduce((values, row) => {
            colorColumns.forEach((key) => {
              values.push(row[key])
            })
            return values
          }, [])
          .filter(Boolean)
          .filter(deduplicate)

    colorScale = getColorMapper(props, colorValues)
  }

  const content = (
    <div {...styles.container}>
      <table {...styles.table}>
        <thead>
          <tr>
            {columns.map((tableHead, index) => (
              <th
                {...styles.header}
                {...colorScheme.set('borderBottomColor', 'text')}
                style={{
                  textAlign: numericColumns.includes(tableHead)
                    ? 'right'
                    : 'left',
                  cursor: sortable ? 'pointer' : undefined,
                  whiteSpace: sortBy.key === tableHead ? 'nowrap' : undefined,
                  width: tableColumns.find((d) => d.column === tableHead)
                    ? tableColumns.find((d) => d.column === tableHead).width
                    : undefined,
                  verticalAlign: cellVerticalAlign,
                }}
                key={index}
                onClick={() => {
                  if (sortable) {
                    setSort(columns[index])
                  }
                }}
              >
                {tableHead}
                {sortBy.key &&
                  sortBy.key === tableHead &&
                  (sortBy.order === 'desc' ? (
                    <IconExpandMore style={{ paddingLeft: '2px' }} />
                  ) : (
                    <IconExpandLess style={{ paddingLeft: '2px' }} />
                  ))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ marginTop: '5px' }}>
          {parsedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              {...(rowIndex % 2 !== 0 &&
                colorScheme.set('backgroundColor', 'hover'))}
            >
              {columns.map((cellKey, cellIndex) => (
                <Cell
                  key={cellIndex}
                  barChartExtent={barChartExtent}
                  {...tableColumns.find((d) => d.column === cellKey)}
                  isNumeric={numericColumns.includes(cellKey)}
                  value={row[cellKey]}
                  colorScale={colorScale}
                  columnName={cellKey}
                  isBarColumn={barColumns.includes(cellKey)}
                  numberFormatter={numberFormatter}
                  verticalAlign={cellVerticalAlign}
                >
                  {numberColumns.includes(cellKey)
                    ? numberFormatter(row[cellKey])
                    : dateColumns.includes(cellKey)
                    ? dateFormatter(row[cellKey])
                    : row[cellKey]}
                </Cell>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  if (collapsable) {
    const height = 40 * 6
    return (
      <Collapsable
        labelPrefix='table'
        height={{ mobile: height, desktop: height }}
        t={t}
      >
        {content}
      </Collapsable>
    )
  }
  return content
}

export const propTypes = {
  values: PropTypes.array.isRequired,
  tableColumns: PropTypes.arrayOf(
    PropTypes.shape({
      column: PropTypes.string,
      type: PropTypes.string,
      width: PropTypes.string,
      color: PropTypes.bool,
    }),
  ),
  numberFormat: PropTypes.string.isRequired,
  sortable: PropTypes.bool,
  cellVerticalAlign: PropTypes.string,
  defaultSortColumn: PropTypes.string,
  colorMap: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  colorRange: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  colorRanges: PropTypes.shape({
    diverging2: PropTypes.array.isRequired,
    sequential3: PropTypes.array.isRequired,
    discrete: PropTypes.array.isRequired,
  }).isRequired,
  collapsable: PropTypes.bool,
}

Table.propTypes = propTypes

export default Table

const Cell = (props) => {
  const {
    columnName,
    width,
    color,
    colorScale,
    value,
    children,
    isNumeric,
    isBarColumn,
    barChartExtent,
    numberFormatter,
    verticalAlign,
  } = props

  const maxWidth = isBarColumn && (width || 100)

  const barScale = scaleLinear()
    .domain(barChartExtent)
    .range([0, maxWidth - PADDING])

  return (
    <td
      {...(isNumeric && styles.cellNumeric)}
      {...styles.cell}
      style={{
        width: width !== undefined ? +width : undefined,
        backgroundColor:
          !isBarColumn && color ? colorScale(value) : 'transparent',
        color: !isBarColumn && color && getTextColor(colorScale(value)),
        whiteSpace: isBarColumn && 'nowrap',
        verticalAlign,
      }}
    >
      {isBarColumn ? (
        <BarComponent
          colorScale={colorScale}
          barWidth={Math.ceil(barScale(value))}
          label={numberFormatter(value)}
          columnName={columnName}
          color={color}
        />
      ) : (
        children
      )}
    </td>
  )
}

const BarComponent = (props) => {
  const { barWidth, color, label, columnName, colorScale } = props

  const labelSize = labelGauger(label)
  const BAR_LABEL_PADDING = 5

  const isLabelOutside = labelSize > barWidth

  return (
    <>
      <span
        style={{
          display: 'inline-block',
          position: 'relative',
          verticalAlign: 'middle',
          width: barWidth,
          backgroundColor: color && colorScale(columnName),
          height: '30px',
        }}
      >
        {!isLabelOutside && (
          <span
            style={{
              position: 'absolute',
              top: 0,
              left: BAR_LABEL_PADDING,
              lineHeight: '30px',
              color: color && getTextColor(colorScale(columnName)),
            }}
          >
            {label}
          </span>
        )}
      </span>
      {isLabelOutside && (
        <span
          style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            paddingLeft: barWidth > 0 && BAR_LABEL_PADDING,
            lineHeight: '30px',
          }}
        >
          {label}
        </span>
      )}
    </>
  )
}
