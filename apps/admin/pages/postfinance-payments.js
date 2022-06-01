import { compose } from 'react-apollo'
import { useRouter } from 'next/router'

import App from '../components/App'
import enforceAuthorization from '../components/Auth/withAuthorization'

import { Body, Content, Header } from '../components/Layout'
import PostfinancePayments from '../components/PostfinancePayments/List'

const PostFinance = () => {
  const router = useRouter()
  const changeHandler = (params) => {
    router.replace(
      {
        pathname: '/postfinance-payments',
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
          <PostfinancePayments params={router.query} onChange={changeHandler} />
        </Content>
      </Body>
    </App>
  )
}

export default compose(enforceAuthorization(['supporter', 'accountant']))(
  PostFinance,
)
