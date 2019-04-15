import React from 'react'
import { Mutation, compose } from 'react-apollo'
import gql from 'graphql-tag'
import Router, { withRouter } from 'next/router'

import withT from '../../lib/withT'

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

const RepoArchive = ({ repoId, t }) => {
  return (
    <Mutation mutation={ARCHIVE_REPO} variables={{ repoId }}>
      {archiveRepo => (
        <A href='#' onClick={e => {
          e.preventDefault()
          if (window.confirm(t('repo/archive/confirm', { repoId }))) {
            archiveRepo()
              .then(() => {
                Router.pushRoute('index')
              })
              .catch((error) => {
                if (error.graphQLErrors) {
                  window.alert(error.graphQLErrors.map(({ message }) => message).join('\n'))
                } else {
                  window.alert(error)
                }
              })
          }
        }}>
          {t('repo/archive/button')}
        </A>
      )}
    </Mutation>
  )
}

export default compose(withT, withRouter)(RepoArchive)
