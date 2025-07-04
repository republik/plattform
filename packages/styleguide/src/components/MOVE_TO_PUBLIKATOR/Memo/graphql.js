// TODO: move to publikator itself

import { gql } from '@apollo/client'
import { graphql } from '@apollo/client/react/hoc'
import compose from 'lodash/flowRight'
import withMe from '../../../lib/apollo/withMe'

export const getDisplayAuthor = (author) => {
  const user = author.user || author

  const displayAuthor = {
    id: author.name,
    name: author.name,
    anonymity: false,
  }

  if (user) {
    Object.assign(displayAuthor, {
      id: user.id,
      name: user.name,
      profilePicture: user.portrait,
      slug: user.slug,
    })
  }

  return displayAuthor
}

const asTree = (nodes) => {
  const toComment = (node) => ({
    ...node,
    tags: [],
    displayAuthor: getDisplayAuthor(node.author),
    userCanEdit: !!node.text,
    comments: {
      ...node.comments,
      nodes: childrenOfComment(node.id),
      totalCount: descendantsOfComment(node.id)?.length || 0,
    },
  })

  const descendantsOfComment = (id) =>
    nodes.filter((n) => n.parentIds.indexOf(id) !== -1).map(toComment)

  const childrenOfComment = (id) =>
    nodes
      .filter((n) => n.parentIds[n.parentIds.length - 1] === id)
      .map(toComment)

  return {
    nodes: nodes.filter((n) => n.parentIds.length === 0).map(toComment),
  }
}

const MemoFragment = gql`
  fragment RepoMemo on Memo {
    id
    parentIds
    text
    content
    published
    author {
      name
      user {
        id
        name
        slug
        portrait
      }
    }
    createdAt
    updatedAt
  }
`

const REPO_MEMOS = gql`
  query RepoMemos($repoId: ID!) {
    repo(id: $repoId) {
      id
      memos {
        ...RepoMemo
      }
    }
  }
  ${MemoFragment}
`

const REPO_MEMO_PUBLISH = gql`
  mutation RepoMemoPublish($repoId: ID!, $parentId: ID, $text: String!) {
    memo: publishMemo(repoId: $repoId, parentId: $parentId, text: $text) {
      ...RepoMemo
    }
  }
  ${MemoFragment}
`

const REPO_MEMO_EDIT = gql`
  mutation RepoMemoEdit($id: ID!, $text: String!) {
    memo: editMemo(id: $id, text: $text) {
      ...RepoMemo
    }
  }
  ${MemoFragment}
`

const REPO_MEMO_UNPUBLISH = gql`
  mutation RepoMemoEdit($id: ID!) {
    memo: unpublishMemo(id: $id) {
      ...RepoMemo
    }
  }
  ${MemoFragment}
`

export const withMemos = compose(
  withMe,
  graphql(REPO_MEMOS, {
    options: ({ repoId }) => ({
      variables: { repoId },
      fetchPolicy: 'cache-and-network',
    }),
    props: ({ data }) => {
      // @TODO: CHeck why it's reloading often
      return {
        memos: !data.loading && !!data.repo?.memos && asTree(data.repo.memos),
      }
    },
  }),
  graphql(REPO_MEMO_PUBLISH, {
    props: ({ mutate }) => {
      return {
        publish: (repoId, parentId, text) =>
          mutate({
            variables: { repoId, parentId, text },
            refetchQueries: ['RepoMemos'],
            awaitRefetchQueries: true,
          }),
      }
    },
  }),
  graphql(REPO_MEMO_EDIT, {
    props: ({ mutate }) => ({
      edit: (id, text) => mutate({ variables: { id, text } }),
    }),
  }),
  graphql(REPO_MEMO_UNPUBLISH, {
    props: ({ mutate }) => ({
      unpublish: (id) => mutate({ variables: { id } }),
    }),
  }),
)
