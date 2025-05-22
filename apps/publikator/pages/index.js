import { withRouter } from 'next/router'
import compose from 'lodash/flowRight'

import Layout from '../components/Layout'
import withAuthorization from '../components/Auth/withAuthorization'
import RepoTable from '../components/Repo/Table'
import RepoAdd from '../components/Repo/Add'
import { withDefaultSSR } from '../lib/apollo/helpers'

const Index = () => (
  <Layout>
    <RepoAdd />
    <RepoTable />
  </Layout>
)

export default withDefaultSSR(
  compose(withRouter, withAuthorization(['editor']))(Index),
)
