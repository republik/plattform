import { Mutation } from '@apollo/client/react/components'
import compose from 'lodash/flowRight'
import { gql } from '@apollo/client'
import { useRouter, withRouter } from 'next/router'

import withT from '../../lib/withT'
import { errorToString } from '../../lib/utils/errors'

import { A } from '@project-r/styleguide'

export const ARCHIVE_REPO = gql`
  mutation repoArchive($repoId: ID!) {
    archive(repoIds: [$repoId]) {
      nodes {
        id
      }
    }
  }
`

const RepoArchive = ({ repoId, isTemplate, t }) => {
  const router = useRouter()

  return (
    <Mutation mutation={ARCHIVE_REPO} variables={{ repoId }}>
      {(archiveRepo) => (
        <A
          href='#'
          onClick={(e) => {
            e.preventDefault()
            if (
              window.confirm(
                t(`repo/archive${isTemplate ? '/template/' : '/'}confirm`, {
                  repoId,
                }),
              )
            ) {
              archiveRepo()
                .then(() => {
                  router.push('/')
                })
                .catch((error) => {
                  window.alert(errorToString(error))
                })
            }
          }}
        >
          {t(`repo/archive${isTemplate ? '/template/' : '/'}button`)}
        </A>
      )}
    </Mutation>
  )
}

export default compose(withT, withRouter)(RepoArchive)
