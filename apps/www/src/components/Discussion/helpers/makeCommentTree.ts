import { CommentFragmentType } from '../graphql/fragments/CommentFragment.graphql'

export type CommentTreeNode = CommentFragmentType & {
  comments: {
    nodes: CommentTreeNode[]
  }
}

type CommentsData<CommentType> = {
  totalCount: number
  directTotalCount: number
  pageInfo: {
    hasNextPage: boolean
    endCursor: string
  }
  nodes: CommentType[]
}

function makeCommentTree({
  nodes,
  pageInfo,
  directTotalCount,
  totalCount,
}: CommentsData<CommentFragmentType>): CommentsData<CommentTreeNode> {
  const convertComment = (node) => ({
    ...node,
    comments: {
      ...node.comments,
      nodes: childrenOfComment(node.id),
    },
  })

  const childrenOfComment = (id) =>
    nodes
      .filter((n) => n.parentIds[n.parentIds.length - 1] === id)
      .map(convertComment)

  return {
    totalCount,
    directTotalCount,
    pageInfo,
    nodes: nodes.filter((n) => n.parentIds.length === 0).map(convertComment),
  }
}

export default makeCommentTree
