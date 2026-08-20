import Link from 'next/link'
import { css } from '@republik/theme/css'
import { linkOverlay } from '@republik/theme/patterns'
import { IconCheck } from '@republik/icons'

import { getHighlight } from '../../lib/typesense-adapter'
import { formatExcerpt, timeFormat } from '@/lib/utils/format'
import { Highlight } from './highlight'

const formatDate = timeFormat('%d.%m.%Y')

export function CommentResult({ comment }) {
  const bodySnippet = getHighlight(comment.highlights, 'contentString')
  const author = comment.displayAuthor

  // discussionPath is only ever set for a comment attached to an article
  // (see typesense-adapter.js), so the /dialog prefix always applies here --
  // no need for CommentLink's generic discussion-shape branching.
  const discussionHref = comment.discussionPath
    ? { pathname: `/dialog${comment.discussionPath}`, query: { focus: comment.id } }
    : undefined

  return (
    <div
      className={css({
        pb: 4,
        mb: 4,
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: 'divider',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      })}
    >
      <div
        className={css({ display: 'flex', alignItems: 'center', gap: 2 })}
      >
        {author?.portrait && (
          <img
            src={author.portrait}
            width='32'
            height='32'
            alt=''
            className={css({ borderRadius: '96px', flexShrink: 0 })}
          />
        )}
        <div className={css({ fontSize: 14 })}>
          {author ? (
            author.slug ? (
              <Link href={`/~${author.slug}`}>{author.name}</Link>
            ) : (
              <span>{author.name}</span>
            )
          ) : null}
          {author?.credential && (
            <span
              className={css({
                ml: 1,
                color: author.credential.verified ? 'text' : 'textSoft',
              })}
            >
              {author.credential.description}
              {author.credential.verified && (
                <IconCheck
                  size={14}
                  className={css({ fill: 'primary', ml: 1 })}
                />
              )}
            </span>
          )}
          <span className={css({ color: 'textSoft', ml: 2 })}>
            {formatDate(new Date(comment.createdAt))}
          </span>
        </div>
      </div>

      {comment.tag && (
        <span className={css({ fontSize: 'xs', color: 'primary' })}>
          {comment.tag}
        </span>
      )}

      <p className={css({ position: 'relative' })}>
        {discussionHref && (
          <Link
            href={discussionHref}
            className={linkOverlay()}
            aria-label='Zum Beitrag'
          />
        )}
        {bodySnippet ? (
          <Highlight snippet={formatExcerpt(bodySnippet)} />
        ) : (
          comment.preview?.string + (comment.preview?.more ? '…' : '')
        )}
      </p>
    </div>
  )
}
