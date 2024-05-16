import { Comment, DisplayAuthor } from './types'

export type CommentLinkProps = {
  children?: React.ReactNode
  discussion?: unknown
  comment?: Partial<Comment>
  displayAuthor?: DisplayAuthor
  passHref?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DefaultCommentLink({ children, ..._ }: CommentLinkProps) {
  return children
}
