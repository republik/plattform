import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { scaleThreshold, scaleLinear, scaleOrdinal } from 'd3-scale'
import { extent, range } from 'd3-array'
import { useColorContext } from '../Colors/ColorContext'
import { getFormat } from './utils'
import { ExpandMoreIcon, ExpandLessIcon } from '../Icons'

import { sansSerifRegular18 } from '../Typography/styles'

import { getTextColor } from './utils'

const NaN2Zero = number => (window.Number.isNaN(number) ? 0 : number)

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
    borderSpacing: '20px 0',
    borderCollapse: 'separate'
  }),
  header: css({
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    padding: '6px 0',
    userSelect: 'none'
  }),
  cell: css({
    padding: '6px 0',
    verticalAlign: 'top'
  }),
  placeholder: css({
    display: 'inline-block',
    width: '18px',
    height: '18px'
  })
}

const Table = props => {
  const [colorScheme] = useColorContext()
  const {
    values,
    numberColumns,
    numberFormat,
    enableSorting,
    colorBy,
    colorRanges,
    colorRange,
    defaultSortColumn,
    customThreshold
  } = props
  const columns = values.columns

  const [sortBy, setSortBy] = useState({
    key: defaultSortColumn || columns[0],
    order: 'desc'
  })

  let parsedData = []

  values.forEach(row => {
    let parsedItem = {}
    Object.keys(row).forEach(
      item =>
        (parsedItem[item] = numberColumns.includes(item)
          ? +row[item]
          : row[item])
    )
    parsedData.push({ ...parsedItem })
  })

  const sortedData = parsedData.sort((a, b) => {
    if (!enableSorting) {
      return
    }
    if (typeof a[sortBy.key] === 'string') {
      return sortBy.order === 'desc'
        ? a[sortBy.key].localeCompare(b[sortBy.key])
        : b[sortBy.key].localeCompare(a[sortBy.key])
    }
    return sortBy.order === 'desc'
      ? NaN2Zero(b[sortBy.key]) - NaN2Zero(a[sortBy.key])
      : NaN2Zero(a[sortBy.key]) - NaN2Zero(b[sortBy.key])
  })

  // helper function that toggles order (desc/asc) or sets new sort by key (order: desc)
  const setSort = key => {
    if (sortBy.key === key) {
      setSortBy({ key, order: sortBy.order === 'desc' ? 'asc' : 'desc' })
    } else {
      setSortBy({ key, order: 'desc' })
    }
  }

  const colorDomain = extent(parsedData, d => d[colorBy])
  const currentColorRange = colorRanges[colorRange] || colorRange

  const colorScale = scaleThreshold()
    .range(currentColorRange)
    .domain(range(colorDomain[0], colorDomain[1], customThreshold))

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
                  textAlign: numberColumns.includes(tableHead)
                    ? 'center'
                    : 'left',
                  cursor: enableSorting && 'pointer'
                }}
                key={index}
                onClick={() => setSort(columns[index])}
              >
                {tableHead}
                {enableSorting &&
                  sortBy.key === tableHead &&
                  (sortBy.order === 'desc' ? (
                    <ExpandMoreIcon />
                  ) : (
                    <ExpandLessIcon />
                  ))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.keys(row).map((cellKey, cellIndex) => (
                <td
                  key={cellIndex}
                  {...styles.cell}
                  style={{
                    textAlign: numberColumns.includes(cellKey)
                      ? 'center'
                      : 'left',
                    backgroundColor:
                      colorBy === cellKey
                        ? colorScale(row[cellKey])
                        : 'transparent',
                    color:
                      colorBy === cellKey &&
                      getTextColor(colorScale(row[cellKey]))
                  }}
                >
                  {numberColumns.includes(cellKey)
                    ? getFormat(numberFormat)(row[cellKey])
                    : row[cellKey]}
                </td>
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
  sparkLine: PropTypes.object,
  values: PropTypes.array.isRequired,
  numberColumns: PropTypes.array,
  numberFormat: PropTypes.string.isRequired,
  enableSorting: PropTypes.bool,
  defaultSortColumn: PropTypes.string,
  customThreshold: PropTypes.number
}

Table.propTypes = propTypes

Table.defaultProps = {
  color: 'label',
  colorRange: 'sequential',
  values: [],
  numberColumns: [],
  numberFormat: 's',
  enableSorting: false,
  customThreshold: 10
}

export default Table
