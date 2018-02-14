import React from 'react'
import Chart from './'
import { csvParse } from 'd3-dsv'

export default ({values, ...rest}) =>
  <Chart values={csvParse(values)} {...rest} />
