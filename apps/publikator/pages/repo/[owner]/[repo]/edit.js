import { Loader } from '@project-r/styleguide'
import compose from 'lodash/flowRight'

import { withDefaultSSR } from '../../../../lib/apollo/helpers'
import withAuthorization from '../../../../components/Auth/withAuthorization'
import MdastEditPage from '../../../../components/editor/MdastPage'

import {
  withCommitData,
  withLatestCommit,
} from '../../../../components/Edit/enhancers'
import { withRouter } from 'next/router'
import { ThemeProvider } from '../../../../components/theme-provider'

const EditPageSwitch = ({ data, router: { query } }) => {
  if (data?.loading) {
    return <Loader loading />
  }
  return (
    <ThemeProvider forcedTheme='light'>
      <MdastEditPage />
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
