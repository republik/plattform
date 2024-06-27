import { Chart } from '@project-r/styleguide'
import { csvParse } from 'd3-dsv'

export const CsvChart = ({ values, ...rest }) => (
  <Chart values={csvParse(values)} {...rest} />
)
