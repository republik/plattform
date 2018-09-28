import React from 'react'
import PropTypes from 'prop-types'

import ColorLegend from './ColorLegend'

const ScatterPlot = (props) => {
  const {
    width,
    description,
    children
  } = props

  const color = a => a
  const colorValues = []

  return (
    <div>
      <svg width={width} height={width}>
        <desc>{description}</desc>
      </svg>
      <div>
        <ColorLegend inline values={(
          []
            .concat(props.colorLegend && colorValues.length > 0 && colorValues.map(colorValue => (
              {color: color(colorValue), label: colorValue}
            )))
            .filter(Boolean)
        )}/>
        {children}
      </div>
    </div>
  )
}

ScatterPlot.propTypes = {
  children: PropTypes.node,
  values: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  mini: PropTypes.bool,
  color: PropTypes.string,
  colorLegend: PropTypes.bool,
  colorRange: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  colorRanges: PropTypes.shape({
    sequential3: PropTypes.array.isRequired,
    discrete: PropTypes.array.isRequired
  }).isRequired,
  column: PropTypes.string,
  columnFilter: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    test: PropTypes.string.isRequired
  })),
  t: PropTypes.func.isRequired,
  description: PropTypes.string
}

ScatterPlot.defaultProps = {

}

export default ScatterPlot
