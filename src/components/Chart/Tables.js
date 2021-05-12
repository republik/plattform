import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { scaleThreshold } from 'd3-scale'
import { extent, range } from 'd3-array'

import { sansSerifMedium14, sansSerifRegular12 } from '../Typography/styles'

import { getTextColor } from './utils'

const NaN2Zero = number => (window.Number.isNaN(number) ? 0 : number)

const styles = {
  wrapper: css({
    background: 'transparent'
  }),
  head: css({
    ...sansSerifMedium14,
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid'
  }),
  headerCell: css({
    border: 'none',
    margin: 0,
    padding: '12px 12px',
    appearance: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    backgroundColor: 'transparent',
    backgroundPosition: 'right 8px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '10px 10px'
  }),
  row: css({
    ...sansSerifRegular12,
    backgroundColor: 'transparent',
    margin: '0 0 1px',
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
    flexGrow: 0,
    flexShrink: 0
  }),
  cell: css({
    padding: '12px 12px',
    flexDirection: 'column'
  })
}

const Tables = props => {
  const {
    values,
    unit,
    color: colorProp,
    columns,
    columnHeaders,
    mobileHeaders,
    width,
    colorBy,
    colorScheme
  } = props
  const margins = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }

  const mapValues = values.map(d => ({
    ...d,
    value: +d.value
  }))

  const [sortBy, setSortBy] = useState({
    key: columns[0],
    order: 'desc'
  })
  const columnsCount = columns.length
  const dynamicStyles = useMemo(() => {
    return {
      cell: css({
        flexBasis: width / columnsCount,
        maxWidth: width / columnsCount,
        width: width / columnsCount
      })
    }
  }, [width, columnsCount])

  // helper function that toggles order (desc/asc) or sets new sort by key (order: desc)
  const setSort = key => {
    if (sortBy.key === key) {
      setSortBy({ key, order: sortBy.order === 'desc' ? 'asc' : 'desc' })
    } else {
      setSortBy({ key, order: 'desc' })
    }
  }

  const sortedData = mapValues.sort((a, b) => {
    if (typeof a[sortBy.key] === 'string') {
      return sortBy.order === 'desc'
        ? a[sortBy.key].localeCompare(b[sortBy.key])
        : b[sortBy.key].localeCompare(a[sortBy.key])
    }
    return sortBy.order === 'desc'
      ? NaN2Zero(b[sortBy.key]) - NaN2Zero(a[sortBy.key])
      : NaN2Zero(a[sortBy.key]) - NaN2Zero(b[sortBy.key])
  })

  const colorDomain = extent(mapValues, d => d[colorBy])
  const colorRange = props.colorRanges[props.colorRange]

  const colorScale = scaleThreshold()
    .domain(range(colorDomain[0], colorDomain[1], 10))
    .range(colorRange)

  return (
    <section {...styles.wrapper} {...colorScheme.set('color', 'text')}>
      <div {...styles.head}>
        {columnHeaders.map((entry, i) => (
          <button
            {...colorScheme.set('color', 'text')}
            key={columns[i]}
            {...styles.headerCell}
            {...dynamicStyles.cell}
            onClick={() => setSort(columns[i])}
          >
            {entry}
          </button>
        ))}
      </div>
      <div>
        {sortedData.map((row, i) => (
          <div key={`row-${i}`} {...styles.row}>
            {columns.map((column, i) => (
              <div
                key={`cell-${i}`}
                {...styles.cell}
                {...dynamicStyles.cell}
                style={{
                  backgroundColor:
                    colorBy === column
                      ? colorScale(row[column])
                      : 'transparent',
                  color:
                    colorBy === column && getTextColor(colorScale(row[column]))
                }}
              >
                {row[column]}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
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
  values: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired
    })
  ).isRequired
}

Tables.propTypes = propTypes

Tables.defaultProps = {
  color: 'label',
  values: []
}

export default Tables
