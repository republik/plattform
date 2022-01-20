import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { css } from 'glamor'
import { scaleThreshold, scaleQuantize, scaleOrdinal } from 'd3-scale'
import { extent } from 'd3-array'

import { useColorContext } from '../Colors/ColorContext'
import { getFormat, getTextColor } from './utils'
import { ExpandMoreIcon, ExpandLessIcon } from '../Icons'
import { defaultProps } from './ChartContext'
import { sansSerifRegular18 } from '../Typography/styles'

const styles = {
  container: css({
    overflowX: 'auto',
    overflowY: 'hidden',
    marginLeft: '-20px',
    marginRight: '-20px'
  }),
  table: css({
    ...sansSerifRegular18,
    lineHeight: '1.2',
    minWidth: '100%',
    borderSpacing: '0 2px',
    borderCollapse: 'separate'
  }),
  header: css({
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    padding: '8px 0',
    userSelect: 'none',
    '&:first-of-type': {
      padding: '8px 0 8px 20px'
    },
    '&:last-of-type': {
      padding: '8px 20px 8px 0'
    }
  }),
  cell: css({
    padding: '8px 0',
    '&:first-of-type': {
      padding: '8px 0 8px 20px'
    },
    '&:last-of-type': {
      padding: '8px 20px 8px 0'
    }
  })
}

const Table = props => {
  const [colorScheme] = useColorContext()
  const {
    values,
    numberFormat,
    colorRanges,
    colorRange,
    defaultSortColumn,
    thresholds,
    tableColumns
  } = props
  const columns = values.columns

  const [sortBy, setSortBy] = useState({
    key: defaultSortColumn,
    order: 'desc',
    enableSorting: !!defaultSortColumn || false
  })

  let parsedData = []

  values.forEach(row => {
    let parsedItem = {}
    Object.keys(row).forEach(
      item =>
        (parsedItem[item] =
          tableColumns.find(d => d.column === item)?.type === 'number'
            ? +row[item]
            : row[item])
    )
    parsedData.push({ ...parsedItem })
  })

  const sortedData = parsedData.sort((a, b) => {
    if (!sortBy.enableSorting) {
      return parsedData
    }
    if (typeof a[sortBy.key] === 'string') {
      return sortBy.order === 'desc'
        ? a[sortBy.key].localeCompare(b[sortBy.key])
        : b[sortBy.key].localeCompare(a[sortBy.key])
    }
    return sortBy.order === 'desc'
      ? b[sortBy.key] - a[sortBy.key]
      : a[sortBy.key] - b[sortBy.key]
  })

  // helper function that toggles order (desc/asc) or sets new sort by key (order: desc)
  const setSort = key => {
    if (sortBy.key === key) {
      setSortBy({
        key,
        order: sortBy.order === 'desc' ? 'asc' : 'desc',
        enableSorting: true
      })
    } else {
      setSortBy({ key, order: 'desc', enableSorting: true })
    }
  }

  let currentColorRange = colorRanges[colorRange] || colorRange

  const colorScale = (type, column) => {
    let scale
    let domain
    if (type === 'number') {
      if (thresholds) {
        scale = scaleThreshold()
        domain = thresholds
        if (!colorRange) {
          currentColorRange = colorRanges.sequential.slice(0, domain.length + 1)
        }
      } else {
        scale = scaleQuantize()
        domain = extent(parsedData, d => d[column])
      }
    } else {
      scale = scaleOrdinal()
      domain = parsedData.map(d => d[column])
      currentColorRange = colorRanges.discrete.slice(0, domain.length + 1)
    }
    return scale
      .domain(domain)
      .range(currentColorRange || colorRanges.sequential)
  }

  return (
    <div {...styles.container}>
      <table {...styles.table}>
        <thead>
          <tr>
            {columns.map((tableHead, index) => (
              <th
                {...styles.header}
                {...colorScheme.set('borderBottomColor', 'text')}
                style={{
                  textAlign:
                    tableColumns.find(d => d.column === tableHead)?.type ===
                    'number'
                      ? 'right'
                      : 'left',
                  cursor: 'pointer'
                }}
                key={index}
                onClick={() => setSort(columns[index])}
              >
                {tableHead}
                {sortBy.enableSorting &&
                  sortBy.key === tableHead &&
                  (sortBy.order === 'desc' ? (
                    <ExpandMoreIcon style={{ paddingLeft: '2px' }} />
                  ) : (
                    <ExpandLessIcon style={{ paddingLeft: '2px' }} />
                  ))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ marginTop: '5px' }}>
          {sortedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              {...(rowIndex % 2 !== 0 &&
                colorScheme.set('backgroundColor', 'hover'))}
            >
              {Object.keys(row).map((cellKey, cellIndex) => (
                <Cell
                  key={cellIndex}
                  style={styles.cell}
                  column={cellKey}
                  type={tableColumns.find(d => d.column === cellKey)?.type}
                  width={tableColumns.find(d => d.column === cellKey)?.width}
                  color={tableColumns.find(d => d.column === cellKey)?.color}
                  value={row[cellKey]}
                  colorScale={colorScale}
                >
                  {tableColumns.find(d => d.column === cellKey)?.type ===
                  'number'
                    ? getFormat(numberFormat)(row[cellKey])
                    : row[cellKey]}
                </Cell>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const propTypes = {
  width: PropTypes.number.isRequired,
  unit: PropTypes.string,
  colorBy: PropTypes.string,
  color: PropTypes.string,
  colorMap: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  colorRange: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  colorRanges: PropTypes.shape({
    diverging2: PropTypes.array.isRequired,
    sequential3: PropTypes.array.isRequired,
    discrete: PropTypes.array.isRequired
  }).isRequired,
  values: PropTypes.array.isRequired,
  tableColumns: PropTypes.array,
  numberFormat: PropTypes.string.isRequired,
  enableSorting: PropTypes.bool,
  defaultSortColumn: PropTypes.string,
  customThreshold: PropTypes.number
}

Table.defaultProps = defaultProps.Table

Table.propTypes = propTypes

export default Table

const Cell = props => {
  const {
    style,
    type,
    width,
    color,
    colorScale,
    value,
    column,
    children
  } = props
  return (
    <td
      {...style}
      style={{
        width: width + 'px',
        textAlign: type === 'number' ? 'right' : 'left',
        fontFeatureSettings: type === 'number' && '"tnum", "kern"',
        backgroundColor: color
          ? colorScale(type, column)(value)
          : 'transparent',
        color: color && getTextColor(colorScale(type, column)(value))
      }}
    >
      {children}
    </td>
  )
}
