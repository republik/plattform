import withAuthorization from '../../../../components/Auth/withAuthorization'
import Edit from '../../../../components/Edit'
import { WarningContextProvider } from '../../../../components/Edit/Warnings'
import compose from 'lodash/flowRight'

const Index = () => (
  <WarningContextProvider>
    <Edit />
  </WarningContextProvider>
)

export default compose(withAuthorization(['editor']))(Index)
