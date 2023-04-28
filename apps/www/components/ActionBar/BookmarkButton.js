import { useState } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { withRouter } from 'next/router'
import { IconButton } from '@project-r/styleguide'

import withT from '../../lib/withT'
import {
  onDocumentFragment,
  BOOKMARKS_COLLECTION_NAME,
} from '../Bookmarks/fragments'
import { getRefetchQueries } from '../Bookmarks/queries'
import { IconBookmark, IconBookmarkBorder } from '@republik/icons'

const Bookmark = ({
  t,
  bookmarked,
  addDocumentToCollection,
  removeDocumentFromCollection,
  documentId,
  skipRefetch,
  router,
  label,
  labelShort,
  disabled,
  attributes,
}) => {
  const [mutating, setMutating] = useState(false)
  const [error, setError] = useState(undefined)
  const Icon = bookmarked ? IconBookmark : IconBookmarkBorder

  const toggle = () => {
    if (mutating) {
      return
    }
    setMutating(true)
    const mutate = bookmarked
      ? removeDocumentFromCollection
      : addDocumentToCollection
    mutate(documentId, !skipRefetch && router.pathname !== '/lesezeichen')
      .then(() => {
        setMutating(false)
        setError(undefined)
      })
      .catch(() => {
        setMutating(false)
        setError(true)
      })
  }

  const title = t(`bookmark/title/${bookmarked ? 'bookmarked' : 'default'}`)

  return (
    <IconButton
      Icon={Icon}
      title={title}
      label={label}
      labelShort={labelShort}
      onClick={() => toggle()}
      fillColorName={error ? 'error' : mutating ? 'disabled' : 'text'}
      disabled={disabled}
      attributes={attributes}
    />
  )
}

const addMutation = gql`
  mutation addDocumentToCollection($documentId: ID!, $collectionName: String!) {
    addDocumentToCollection(
      documentId: $documentId
      collectionName: $collectionName
    ) {
      id
      document {
        id
        ...BookmarkOnDocument
      }
    }
  }

  ${onDocumentFragment}
`

const removeMutation = gql`
  mutation removeDocumentFromCollection(
    $documentId: ID!
    $collectionName: String!
  ) {
    removeDocumentFromCollection(
      documentId: $documentId
      collectionName: $collectionName
    ) {
      id
      document {
        id
        ...BookmarkOnDocument
      }
    }
  }

  ${onDocumentFragment}
`

export default compose(
  graphql(addMutation, {
    props: ({ mutate }) => ({
      addDocumentToCollection: (documentId, update) =>
        mutate({
          variables: {
            documentId,
            collectionName: BOOKMARKS_COLLECTION_NAME,
          },
          refetchQueries: update ? getRefetchQueries() : [],
        }),
    }),
  }),
  graphql(removeMutation, {
    props: ({ mutate }) => ({
      removeDocumentFromCollection: (documentId, update) =>
        mutate({
          variables: {
            documentId,
            collectionName: BOOKMARKS_COLLECTION_NAME,
          },
          refetchQueries: update ? getRefetchQueries() : [],
        }),
    }),
  }),
  withT,
  withRouter,
)(Bookmark)
