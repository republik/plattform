import { compose } from 'react-apollo'
import withAuthorization from '../../components/Auth/withAuthorization'
import Edit from '../../components/Edit'

const Index = () => <Edit />

export default compose(withAuthorization(['editor']))(Index)
