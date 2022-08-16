import { compose } from 'react-apollo'
import withAuthorization from '../../components/Auth/withAuthorization'
import Edit from '../../components/Edit'
import { WarningContextProvider } from '../../components/Edit/Warnings'

const Index = () => (
  <WarningContextProvider>
    <Edit />
  </WarningContextProvider>
)

export default compose(withAuthorization(['editor']))(Index)
