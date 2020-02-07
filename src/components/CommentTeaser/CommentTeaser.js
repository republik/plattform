import React, { Fragment } from 'react'
import { css } from 'glamor'
import get from 'lodash/get'

import NewPage from 'react-icons/lib/md/open-in-new'

import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { ellipsize, underline } from '../../lib/styleMixins'
import { inQuotes } from '../../lib/inQuotes'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { linkRule } from '../Typography/'
import { serifRegular14, sansSerifRegular14 } from '../Typography/styles'
import { CommentBodyParagraph } from '../CommentBody/web'
import { Context, Header } from '../Discussion/Internal/Comment'
import RawHtml from '../RawHtml/'
import {
  DiscussionContext,
  formatTimeRelative
} from '../Discussion/DiscussionContext'

const styles = {
  root: css({
    borderTop: `1px solid ${colors.text}`,
    margin: '0 0 40px 0',
    paddingTop: 10
  }),
  header: css({
    marginBottom: 10
  }),
  body: css({
    ...serifRegular14,
    wordWrap: 'break-word',
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
    '@media (hover)': {
      ':hover': {
        ...underline
      }
    }
  }),
  footer: css({
    ...sansSerifRegular14,
    display: 'flex',
    justifyContent: 'space-between'
  }),
  discussionReference: css({
    ...ellipsize,
    color: colors.lightText,
    position: 'relative'
  }),
  icon: css({
    position: 'absolute',
    right: 0,
    marginTop: '-2px'
  }),
  timeago: css({
    color: colors.lightText,
    flexShrink: 0,
    paddingLeft: 10
  })
}

const ICON_SIZE = 18

const DefaultLink = ({ children }) => children

export const CommentTeaser = ({
  t,
  id,
  displayAuthor,
  preview,
  highlights,
  createdAt,
  Link = DefaultLink,
  discussion,
  tags,
  parentIds,
  onClick,
  newPage
}) => {
  const isDesktop = useMediaQuery(mUp)

  const highlight = get(highlights, '[0].fragments[0]', '').trim()

  const endsWithPunctuation =
    highlight &&
    (Math.abs(highlight.lastIndexOf('...') - highlight.length) < 4 ||
      Math.abs(highlight.lastIndexOf('…') - highlight.length) < 2 ||
      Math.abs(highlight.lastIndexOf('.') - highlight.length) < 2)

  // assuming frontend currently supports only one tag.
  const tag = tags && !!tags.length && tags[0]

  /*
   * A reduced version of DiscussionContext value, just enough so we can render
   * the Comment Header component.
   */
  const clock = {
    now: Date.now(),
    t,
    isDesktop
  }
  // stable component function identities to avoid unnecessary rerender
  /* eslint-disable react-hooks/exhaustive-deps */
  // eslint does not detect JSX Link as necessary dependecy
  const links = React.useMemo(() => {
    return {
      Profile: ({ displayAuthor, ...props }) => (
        <Link
          {...props}
          discussion={discussion}
          displayAuthor={displayAuthor}
        />
      ),
      Comment: ({ comment, ...props }) => (
        <Link {...props} discussion={discussion} commentId={comment.id} />
      )
    }
  }, [Link, discussion])
  /* eslint-enable react-hooks/exhaustive-deps */

  const discussionContextValue = {
    discussion,
    clock,
    links
  }

  return (
    <DiscussionContext.Provider value={discussionContextValue}>
      <div id={id} {...styles.root}>
        {displayAuthor && (
          <div {...styles.header}>
            <Header t={t} comment={{ id, displayAuthor, createdAt }} />
          </div>
        )}
        {tag && (
          <Context
            title={
              <Link commentId={id} discussion={discussion} passHref>
                <a {...styles.link}>{tag}</a>
              </Link>
            }
          />
        )}
        <div
          {...styles.body}
          style={{ marginTop: displayAuthor || tag ? undefined : 0 }}
        >
          <CommentBodyParagraph>
            <Link commentId={id} discussion={discussion} passHref>
              <a {...styles.link}>
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
          <div
            {...styles.discussionReference}
            style={{
              paddingRight: newPage ? `${ICON_SIZE + 5}px` : undefined
            }}
          >
            {t.elements(
              `styleguide/CommentTeaser/${
                parentIds && parentIds.length ? 'reply' : 'comment'
              }/link`,
              {
                link: (
                  <Link
                    key={`link-${id}`}
                    commentId={id}
                    discussion={discussion}
                    passHref
                  >
                    <a {...linkRule}>
                      {inQuotes(discussion.title)}
                      {newPage && (
                        <span {...styles.icon}>
                          <NewPage size={ICON_SIZE} fill={colors.disabled} />
                        </span>
                      )}
                    </a>
                  </Link>
                )
              }
            )}
          </div>
          {!displayAuthor && (
            <div {...styles.timeago}>
              <Link commentId={id} discussion={discussion} passHref>
                <a {...styles.linkUnderline} suppressHydrationWarning>
                  {formatTimeRelative(new Date(createdAt), {
                    ...clock,
                    direction: 'past'
                  })}
                </a>
              </Link>
            </div>
          )}
        </div>
      </div>
    </DiscussionContext.Provider>
  )
}

export default CommentTeaser
