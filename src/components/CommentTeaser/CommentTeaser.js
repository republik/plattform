import React, { Fragment } from 'react'
import { css } from 'glamor'
import get from 'lodash/get'

import colors from '../../theme/colors'
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
  timeago: css({
    ...sansSerifRegular14,
    color: colors.lightText
  })
}

const DefaultLink = ({ children }) => children

export const CommentTeaser = ({
  t,
  id,
  displayAuthor,
  preview,
  highlights,
  published,
  createdAt,
  timeago,
  context,
  lineClamp,
  Link=DefaultLink,
  discussion,
  tags,
  onPreviewClick
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
            published={published}
            createdAt={createdAt}
            timeago={timeago}
            Link={Link} />
        </div>
      )}
      {context && (
        <CommentContext
          title={
            <Link
              commentId={id}
              discussion={discussion}
              passHref
            >
              <a {...styles.link} onClick={onPreviewClick}>
                {context.title}
              </a>
            </Link>
          }
          description={context.description}
        />
      )}
      {tag && (
        <CommentContext
          title={
            <Link
              commentId={id}
              discussion={discussion}
              passHref
            >
              <a {...styles.link} onClick={onPreviewClick}>
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
            <a {...styles.link} onClick={onPreviewClick}>
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
      {!displayAuthor && (
        <div {...styles.timeago}>
          {timeago(createdAt)}
          {/*<CommentTeaserFooter
            id={id}
            discussion={discussion}
            Link={Link}
            timeago={timeago(createdAt)}
            t={t}
          />*/}
        </div>
      )}
    </div>
  )
}

export default CommentTeaser
