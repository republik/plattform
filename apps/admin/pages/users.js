import { useRouter } from 'next/router'
import compose from 'lodash/flowRight'
import { enforceAuthorization } from '../components/Auth/withAuthorization'
import App from '../components/App'
import { Body, Content, Header } from '../components/Layout'
import Users from '../components/Users/List'

const UserOverview = () => {
  const router = useRouter()

  const changeHandler = (params) => {
    router.replace(
      {
        pathname: '/users',
        query: params ?? {},
      },
      undefined,
      { shallow: true },
    )
  }

  return (
    <App>
      <Body>
        <Header search={router.query.search} />
        <Content id='content'>
          <Users params={router.query} onChange={changeHandler} />
        </Content>
      </Body>
    </App>
  )
}

export default compose(enforceAuthorization(['supporter']))(UserOverview)
