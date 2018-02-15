import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { measure } from './utils'
import Bar, { Lollipop } from './Bars'
import { Line, Slope } from './Lines';
import colors from '../../theme/colors'
import { P } from '../Typography/Interaction'

const ReactCharts = {
  Bar,
  Lollipop,
  Line,
  Slope
}

const createRanges = ({neutral, sequential3, opposite3, discrete}) => {
  const oppositeReversed = [].concat(opposite3).reverse()
  return {
    diverging1: [sequential3[0], opposite3[0]],
    diverging1n: [sequential3[0], neutral, opposite3[0]],
    diverging2: [...sequential3.slice(0, 2), ...oppositeReversed.slice(0, 2)],
    diverging3: [...sequential3, ...oppositeReversed],
    sequential3,
    discrete
  }
}

const colorRanges = createRanges(colors)

class Chart extends Component {
  constructor(props) {
    super(props)

    this.state = {
      width: 290
    }
    this.measure = measure((ref, {width}) => {
      if (width !== this.state.width) {
        this.setState({width})
      }
    })
  }
  componentDidCatch(error, info) {
    this.setState({ hasError: true })
    if (typeof console !== 'undefined' && console.error) {
      console.error(error, info)
    }
  }
  render() {
    const {width: fixedWidth, config, t} = this.props
    if (this.state.hasError) {
      return (
        <P style={{color: colors.error, margin: '20px 0'}}>
          {t('styleguide/charts/error')}
        </P>
      )
    }

    const width = fixedWidth || this.state.width
    const ReactChart = ReactCharts[config.type]

    return (
      <div ref={fixedWidth ? undefined : this.measure} style={{
        marginTop: config.chromeless ? 0 : 15,
        maxWidth: config.maxWidth
      }}>
        {!!width && (
          <ReactChart {...config}
            t={t}
            colorRanges={colorRanges}
            width={width}
            values={this.props.values}
            description={config.description} />
        )}
      </div>
    )
  }
}

Chart.propTypes = {
  values: PropTypes.array.isRequired,
  config: PropTypes.shape({
    type: PropTypes.oneOf(Object.keys(ReactCharts)).isRequired,
    description: PropTypes.string,
    maxWidth: PropTypes.number,
    chromeless: PropTypes.bool
  }).isRequired,
  width: PropTypes.number,
  t: PropTypes.func.isRequired
}

export default Chart
