import { Loader } from '@project-r/styleguide'
import compose from 'lodash/flowRight'
import { withRouter } from 'next/router'
import withAuthorization from '../../../../components/Auth/withAuthorization'

import EditPage from '../../../../components/editor'
import {
  withCommitData,
  withLatestCommit,
} from '../../../../components/editor/enhancers'
import { ThemeProvider } from '../../../../components/theme-provider'

import { withDefaultSSR } from '../../../../lib/apollo/helpers'

const EditPageSwitch = ({ data }) => {
  if (data?.loading) {
    return <Loader loading />
  }
  return (
    <ThemeProvider forcedTheme='light'>
      <EditPage />
    </ThemeProvider>
  )
}

export default withDefaultSSR(
  compose(
    withAuthorization(['editor']),
    withRouter,
    withCommitData,
    withLatestCommit,
  )(EditPageSwitch),
)
