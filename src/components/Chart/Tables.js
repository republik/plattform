import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { scaleThreshold, scaleLinear, scaleTime } from 'd3-scale'
import { extent, range } from 'd3-array'
import { line } from 'd3-shape'

import { sansSerifMedium14, sansSerifRegular12 } from '../Typography/styles'
import { getColorMapper } from './colorMaps'

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
    flexDirection: 'column',
    maxHeight: '60px'
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

  let sortedData = mapValues.sort((a, b) => {
    if (typeof a[sortBy.key] === 'string') {
      return sortBy.order === 'desc'
        ? a[sortBy.key].localeCompare(b[sortBy.key])
        : b[sortBy.key].localeCompare(a[sortBy.key])
    }
    return sortBy.order === 'desc'
      ? NaN2Zero(b[sortBy.key]) - NaN2Zero(a[sortBy.key])
      : NaN2Zero(a[sortBy.key]) - NaN2Zero(b[sortBy.key])
  })

  if (props.sparkline !== undefined) {
    sortedData = prepareSparklineData(sortedData)
  }

  function prepareSparklineData(data) {
    const xAxis = props.sparkline.xAxis
    const yAxis = props.sparkline.yAxis
    const column = props.sparkline.column

    let sparkLineData = []
    data.map(entry => {
      // element already exists
      const columnExists = sparkLineData.findIndex(
        item => entry[column] === item[column]
      )

      if (columnExists === -1) {
        sparkLineData.push(entry)
      }
    })

    sparkLineData = sparkLineData.map(item => {
      const xAxisValues = data
        .filter(entry => entry[column] === item[column])
        .map(entry => new Date(entry[xAxis]))
      const yAxisValues = data
        .filter(entry => entry[column] === item[column])
        .map(entry => NaN2Zero(entry[yAxis]))
      const values = xAxisValues.map((x, i) => {
        return {
          x: x,
          y: yAxisValues[i]
        }
      })
      const width = 100
      const xAxisScale = scaleTime()
        .domain([
          new Date(xAxisValues[0]),
          new Date(xAxisValues[xAxisValues.length - 1])
        ])
        .range([5, width - 5])
      const height = 20
      const yAxisScale = scaleLinear()
        .domain([Math.min(...yAxisValues), Math.max(...yAxisValues)])
        .range([height - 5, 5])

      item.sparkline = {
        path: line()
          .x(d => xAxisScale(d.x))
          .y(d => yAxisScale(d.y)),
        values: values,
        width: width,
        height: height
      }

      return item
    })

    if (!props.columns.includes('sparkline')) {
      props.columns.push('sparkline')
      props.columnHeaders.push('sparkline')
      props.mobileHeaders.push('sparkline')

      // remove columns used as x and yAxis
      props.columns.splice(props.columns.indexOf(props.sparkline.xAxis), 1)
      props.columns.splice(props.columns.indexOf(props.sparkline.yAxis), 1)
      props.columnHeaders.splice(
        props.columnHeaders.indexOf(props.sparkline.xAxis),
        1
      )
      props.columnHeaders.splice(
        props.columnHeaders.indexOf(props.sparkline.yAxis),
        1
      )
      props.mobileHeaders.splice(
        props.mobileHeaders.indexOf(props.sparkline.xAxis),
        1
      )
      props.mobileHeaders.splice(
        props.mobileHeaders.indexOf(props.sparkline.yAxis),
        1
      )
    }

    return sparkLineData
  }

  function Row(props) {
    return (
      <div key={`row-${props.i}`} {...styles.row}>
        {columns.map((column, i) => (
          <Cell {...props} row={props.row} column={column} key={i} />
        ))}
      </div>
    )
  }

  function Cell(props) {
    if (props.column === 'sparkline') {
      const color = getColorMapper(props)
      const sparkline = props.row.sparkline
      return (
        <div key={`cell-${props.i}`} {...styles.cell} {...dynamicStyles.cell}>
          <svg
            width='100%'
            height='100%'
            viewBox={`0 0 ${sparkline.width} ${sparkline.height}`}
          >
            <path
              d={sparkline.path(sparkline.values)}
              stroke={color(props.row.party)}
              fill='none'
            />
          </svg>
        </div>
      )
    } else {
      return (
        <div
          key={`cell-${props.i}`}
          {...styles.cell}
          {...dynamicStyles.cell}
          style={{
            backgroundColor:
              colorBy === props.column
                ? colorScale(props.row[props.column])
                : 'transparent',
            color:
              colorBy === props.column &&
              getTextColor(colorScale(props.row[props.column]))
          }}
        >
          {props.row[props.column]}
        </div>
      )
    }
  }

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
          <Row {...props} row={row} key={i} />
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
  sparkLine: PropTypes.object,
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
  colorRange: 'sequential',
  values: []
}

export default Tables
