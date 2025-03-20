import Employees from '../Imprint/Employees'

const EmployeesRow = ({
  shuffle = 20,
  slice = 12,
  withBoosted = true,
  minColumns = 3,
  maxColumns = 4,
}) => (
  <Employees
    filter={(e) => e.title}
    shuffle={shuffle}
    slice={slice}
    withBoosted={withBoosted}
    minColumns={minColumns}
    maxColumns={maxColumns}
  />
)

export default EmployeesRow
