import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { scaleThreshold, scaleLinear, scaleTime } from 'd3-scale'
import { extent, range } from 'd3-array'
import { line } from 'd3-shape'
import { useColorContext } from '../Colors/ColorContext'
import { getFormat } from './utils'

import {
  sansSerifMedium14,
  sansSerifRegular12,
  sansSerifRegular18
} from '../Typography/styles'
import { getColorMapper } from './colorMaps'

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
    padding: '6px 0'
  }),
  cell: css({
    padding: '6px 0',
    verticalAlign: 'top'
  })
}

const Table = props => {
  const [colorScheme] = useColorContext()
  const { values, labelCells, numberFormat } = props
  const columns = values.columns
  console.log(values)

  const [sortBy, setSortBy] = useState({
    key: columns[0],
    order: 'desc'
  })

  let parsedData = []

  values.forEach(row => {
    let parsedItem = {}
    Object.keys(row).forEach(
      item =>
        (parsedItem[item] = labelCells.includes(item) ? row[item] : +row[item])
    )
    parsedData.push({ ...parsedItem })
  })

  const sortedData = parsedData.sort((a, b) => {
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
                  textAlign: labelCells.includes(tableHead) ? 'left' : 'center'
                }}
                key={index}
                onClick={() => setSort(columns[index])}
              >
                {tableHead}
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
                    textAlign: labelCells.includes(cellKey) ? 'left' : 'center'
                  }}
                >
                  {labelCells.includes(cellKey)
                    ? row[cellKey]
                    : getFormat(numberFormat)(row[cellKey])}
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
  labelCells: PropTypes.array,
  numberFormat: PropTypes.string.isRequired
}

Table.propTypes = propTypes

Table.defaultProps = {
  color: 'label',
  colorRange: 'sequential',
  values: [],
  labelCells: [],
  numberFormat: 's'
}

export default Table
