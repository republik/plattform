import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { scaleThreshold, scaleLinear, scaleTime } from 'd3-scale'
import { extent, range } from 'd3-array'
import { line } from 'd3-shape'
import { autoType } from 'd3-dsv'
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
    marginTop: '10px',
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
    verticalAlign: 'top',
    textAlign: 'center'
  })
}

const Table = props => {
  const [colorScheme] = useColorContext()

  const { values, labelCells, numberFormat } = props

  const formatted = autoType(values[0])
  console.log({ formatted })
  console.log(values[0])

  const columns = values.columns
  console.log(values)
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
              >
                {tableHead}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {values.map((row, rowIndex) => (
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
