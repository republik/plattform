import {
  CommentEmbedDocument,
  type CommentEmbedQuery,
} from '#graphql/republik-api/__generated__/gql/graphql'
import type { ArticlePortableTextBlockType } from '@/app/(sanity)/groq/portable-text-content-fragment'
import { getClient } from '@/app/lib/apollo/client'
import { formatDateTimeLong, formatTimeAgo } from '@/app/lib/util/time-format'
import type { NestedEditor } from '@/sanity.types'
import { markdownToPortableText } from '@portabletext/markdown'
import { css } from '@republik/theme/css'
import Link from 'next/link'
import { NestedPortableText } from './render'

type EmbedCommentValue = Extract<
  ArticlePortableTextBlockType,
  { _type: 'embedComment' }
>

type LiveComment = CommentEmbedQuery['comment']
type LiveDiscussion = LiveComment['discussion']

function getCommentHref(
  discussion: LiveDiscussion | undefined,
  commentId: string,
) {
  if (!discussion?.path) {
    return
  }

  const [path, search] = discussion.path.split('?')
  const params = new URLSearchParams(search)
  params.set('focus', commentId)

  const pathname =
    discussion.document?.meta?.template === 'article' ? `/dialog${path}` : path

  return `${pathname}?${params}`
}

const rootStyle = css({
  position: 'relative',
  maxWidth: '455px',
  mx: 'auto',
  my: '8',
  py: '3',
  borderColor: 'divider',
  borderStyle: 'solid',
  borderTopWidth: '1px',
  borderBottomWidth: '1px',
  textAlign: 'left',
  color: 'text',
  textStyle: 'sans',
})

const headerStyle = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
})

const portraitStyle = css({
  flexShrink: 0,
  width: '40px',
  height: '40px',
  objectFit: 'cover',
})

const nameStyle = css({
  textStyle: 'sansSerifMedium',
  fontSize: 'm',
  lineHeight: '1.25',
  color: 'text',
  textDecoration: 'none',
})

const metaLineStyle = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1',
  fontSize: 's',
  lineHeight: '1.25',
  color: 'textSoft',
})

const credentialStyle = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1',
  minWidth: 0,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
})

const bodyLinkStyle = css({
  display: 'block',
  my: '3',
  color: 'text',
  textDecoration: 'none',
})

const tagStyle = css({
  textStyle: 'sansSerifMedium',
  fontSize: 'm',
  mb: '2',
})

const footerStyle = css({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '2',
  fontSize: 's',
  fontWeight: 500,
})

const footerLinkStyle = css({
  color: 'primary',
})

export async function EmbedComment({ value }: { value: EmbedCommentValue }) {
  const { id, content, createdAt, discussion } = value

  const { data } = id
    ? await (
        await getClient()
      ).query<CommentEmbedQuery>({
        query: CommentEmbedDocument,
        variables: { id },
      })
    : { data: undefined }

  const live = data?.comment
  const unavailable = !live
  const published = live ? live.published && !live.adminUnpublished : false

  const title = live?.discussion.title ?? discussion?.title
  const href = live ? getCommentHref(live.discussion, live.id) : undefined
  const isReply = (live?.parentIds ?? value.parentIds ?? []).length > 0

  const author = live?.displayAuthor
  const body = content ? markdownToPortableText(content) : undefined

  return (
    <div id={id} className={rootStyle}>
      <div className={headerStyle}>
        {published && author?.profilePicture && (
          <img
            className={portraitStyle}
            src={author.profilePicture}
            alt={author.name}
          />
        )}
        <div className={css({ minWidth: 0, flexGrow: 1 })}>
          <div className={nameStyle}>
            {published && author ? (
              <span>{author.name}</span>
            ) : (
              <span className={css({ color: 'textSoft' })}>
                {unavailable
                  ? '(Autorenschaft nicht verfügbar)'
                  : live?.adminUnpublished
                  ? '(von der Moderation verborgen)'
                  : '(durch User zurückgezogen)'}
              </span>
            )}
          </div>
          <div className={metaLineStyle}>
            {createdAt && (
              <time dateTime={createdAt} title={formatDateTimeLong(createdAt)}>
                {formatTimeAgo(createdAt)}
              </time>
            )}
          </div>
        </div>
      </div>

      <CommentBodyLink href={href}>
        {body && <NestedPortableText value={body as unknown as NestedEditor} />}
      </CommentBodyLink>

      {title && (
        <div className={footerStyle}>
          <div>
            {isReply ? 'Antwort in ' : 'Beitrag in '}
            {href ? (
              <Link href={href} prefetch={false} className={footerLinkStyle}>
                «{title}»
              </Link>
            ) : (
              <span>«{title}»</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function CommentBodyLink({
  href,
  children,
}: {
  href?: string
  children: React.ReactNode
}) {
  if (!href) {
    return <div className={bodyLinkStyle}>{children}</div>
  }

  return (
    <Link href={href} prefetch={false} className={bodyLinkStyle}>
      {children}
    </Link>
  )
}
