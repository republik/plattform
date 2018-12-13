import React, { Fragment } from 'react'
import { css } from 'glamor'
import get from 'lodash/get'

import colors from '../../theme/colors'
import { ellipsize, underline } from '../../lib/styleMixins'
import { linkRule } from '../Typography/'
import { serifRegular14, sansSerifRegular14 } from '../Typography/styles'
import { CommentBodyParagraph } from '../CommentBody/web'
import CommentContext from '../Comment/CommentContext'
import CommentHeader from '../Comment/CommentHeader'
import RawHtml from '../RawHtml/'

const styles = {
  root: css({
    borderTop: `1px solid ${colors.text}`,
    margin: '0 0 40px 0',
    paddingTop: 10
  }),
  header: css({
    marginBottom: 10,
  }),
  body: css({
    ...serifRegular14,
    color: colors.text,
    margin: '10px 0'
  }),
  link: css({
    color: 'inherit',
    textDecoration: 'none',
    cursor: 'pointer',
    '& em': {
      background: colors.primaryBg,
      fontStyle: 'normal'
    }
  }),
  linkUnderline: css({
    color: 'inherit',
    textDecoration: 'none',
    ':hover': {
      ...underline
    }
  }),
  footer: css({
    ...sansSerifRegular14,
    display: 'flex',
    justifyContent: 'space-between'
  }),
  discussionReference: css({
    ...ellipsize
  }),
  timeago: css({
    color: colors.lightText,
    flexShrink: 0,
    paddingLeft: 5
  })
}

const DefaultLink = ({ children }) => children

export const CommentTeaser = ({
  t,
  id,
  displayAuthor,
  preview,
  highlights,
  createdAt,
  timeago,
  Link=DefaultLink,
  discussion,
  tags,
  parentIds,
  onClick
}) => {
  const highlight = get(highlights, '[0].fragments[0]', '').trim()

  const endsWithPunctuation =
    highlight &&
    (Math.abs(highlight.lastIndexOf('...') - highlight.length) < 4 ||
      Math.abs(highlight.lastIndexOf('…') - highlight.length) < 2 ||
      Math.abs(highlight.lastIndexOf('.') - highlight.length) < 2)

  // assuming frontend currently supports only one tag.
  const tag = tags && !!tags.length && tags[0]

  return (
    <div id={id} {...styles.root}>
      {displayAuthor && (
        <div {...styles.header}>
          <CommentHeader
            {...displayAuthor}
            commentId={id}
            createdAt={createdAt}
            timeago={timeago}
            discussion={discussion}
            Link={Link} />
        </div>
      )}
      {tag && (
        <CommentContext
          title={
            <Link
              commentId={id}
              discussion={discussion}
              passHref
            >
              <a {...styles.link} onClick={onClick}>
                {tag}
              </a>
            </Link>
          }
        />
      )}
      <div {...styles.body}>
        <CommentBodyParagraph>
          <Link
            commentId={id}
            discussion={discussion}
            passHref
          >
            <a {...styles.link} onClick={onClick}>
            {!!preview && !highlight && (
              <Fragment>
                {preview.string}
                {!!preview.more && <Fragment>&nbsp;…</Fragment>}
              </Fragment>
            )}
            {!!highlight && (
              <Fragment>
                <RawHtml
                  dangerouslySetInnerHTML={{
                    __html: highlight
                  }}
                />
                {!endsWithPunctuation && <Fragment>&nbsp;…</Fragment>}
              </Fragment>
            )}
            </a>
          </Link>
        </CommentBodyParagraph>
      </div>
      <div {...styles.footer}>
        <div {...styles.discussionReference}>
          {t.elements(`styleguide/CommentTeaser/${parentIds && parentIds.length ? 'reply' : 'comment'}/link`, {
            link: (
              <Link
                key={id}
                commentId={id}
                discussion={discussion}
                passHref
              >
                <a {...linkRule} onClick={onClick}>
                  «{discussion.title}»
                </a>
              </Link>
            )
          })}          
        </div>
        {!displayAuthor && (
          <div {...styles.timeago}>
            <Link commentId={id} discussion={discussion} passHref>
              <a {...styles.linkUnderline} onClick={onClick}>
                {timeago(createdAt)}
              </a>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentTeaser
