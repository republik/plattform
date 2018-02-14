import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { measure } from './utils'
import Bar, { Lollipop } from './Bars'

const ReactCharts = {
  Bar,
  Lollipop
}

const colorSchemes = {
  diverging1: ['#004f80','#a0002d'],
  diverging1n: ['#004f80','#bbbbbb','#a0002d'],
  diverging2: ['#004f80','#467aaf','#df2f5a','#a0002d'],
  diverging3: ['#004f80','#467aaf','#7fafe7','#ff6e8b','#df2f5a','#a0002d'],
  dimension3: ['#004f80','#467aaf','#7fafe7'],
  category24: ['#004f80','#6394cb','#0778a5','#80cfff','#006b84','#2aaec9','#00857c','#71d7cc','#1f6e00','#74b917','#4d7a3b','#a4d38e','#23614e','#79b8a1','#987200','#f2bf18','#a04200','#f28502','#c40046','#ff6e8b','#890d48','#c44d79','#8c1478','#da66c0']
}

class Chart extends Component {
  constructor(props) {
    super(props)

    this.state = {}
    this.measure = measure((ref, {width}) => {
      if (width !== this.state.width) {
        this.setState({width})
      }
    })
  }
  render() {
    const {width: fixedWidth, config, t} = this.props

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
            colorSchemes={colorSchemes}
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
