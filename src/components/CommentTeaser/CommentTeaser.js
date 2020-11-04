import React, { Fragment, useMemo } from 'react'
import { css } from 'glamor'
import get from 'lodash/get'

import { mUp } from '../../theme/mediaQueries'
import { ellipsize, underline } from '../../lib/styleMixins'
import { inQuotes } from '../../lib/inQuotes'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { serifRegular14, sansSerifRegular14 } from '../Typography/styles'
import { A } from '../Typography/'
import { CommentBodyParagraph } from '../CommentBody/web'
import { Context, Header } from '../Discussion/Internal/Comment'
import RawHtml from '../RawHtml/'
import { useColorContext } from '../Colors/useColorContext'
import {
  DiscussionContext,
  formatTimeRelative
} from '../Discussion/DiscussionContext'

const styles = {
  root: css({
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    margin: 0,
    paddingTop: 10,
    paddingBottom: 40
  }),
  header: css({
    marginBottom: 10
  }),
  body: css({
    ...serifRegular14,
    wordWrap: 'break-word',
    margin: '10px 0'
  }),
  link: css({
    color: 'inherit',
    textDecoration: 'none',
    cursor: 'pointer'
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
    position: 'relative'
  }),
  icon: css({
    position: 'absolute',
    right: 0,
    marginTop: '-2px'
  }),
  timeago: css({
    flexShrink: 0,
    paddingLeft: 10
  })
}

const DefaultLink = ({ children }) => children

export const CommentTeaser = ({
  t,
  Link = DefaultLink,
  onClick,
  highlighted,
  menu,
  ...comment
}) => {
  const {
    id,
    discussion,
    tags,
    parentIds,
    displayAuthor,
    preview,
    highlights,
    createdAt
  } = comment
  const isDesktop = useMediaQuery(mUp)
  const [colorScheme] = useColorContext()
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

  const discussionContextValue = {
    discussion,
    clock,
    Link
  }

  const highlightEMRule = useMemo(
    () =>
      css({
        '& em': {
          background: colorScheme.getCSSColor('alert'),
          fontStyle: 'normal'
        }
      }),
    [colorScheme]
  )
  return (
    <DiscussionContext.Provider value={discussionContextValue}>
      <div
        id={id}
        {...styles.root}
        {...colorScheme.set('borderColor', 'text')}
        {...(highlighted && colorScheme.set('backgroundColor', 'hover'))}
      >
        {displayAuthor && (
          <div {...styles.header}>
            <Header
              t={t}
              comment={{ id, displayAuthor, createdAt }}
              menu={menu}
            />
          </div>
        )}
        {tag && (
          <Context
            title={
              <Link comment={comment} discussion={discussion} passHref>
                <a {...styles.link} {...highlightEMRule}>
                  {tag}
                </a>
              </Link>
            }
          />
        )}
        <div
          {...styles.body}
          {...colorScheme.set('color', 'text')}
          style={{ marginTop: displayAuthor || tag ? undefined : 0 }}
        >
          <CommentBodyParagraph>
            <Link comment={comment} discussion={discussion} passHref>
              <a {...styles.link} {...highlightEMRule}>
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
            {...colorScheme.set('color', 'textSoft')}
          >
            {t.elements(
              `styleguide/CommentTeaser/${
                parentIds && parentIds.length ? 'reply' : 'comment'
              }/link`,
              {
                link: (
                  <Link
                    key={`link-${id}`}
                    comment={comment}
                    discussion={discussion}
                    passHref
                  >
                    <A>{inQuotes(discussion.title)}</A>
                  </Link>
                )
              }
            )}
          </div>
          {!displayAuthor && (
            <div {...styles.timeago} {...colorScheme.set('color', 'textSoft')}>
              <Link comment={comment} discussion={discussion} passHref>
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
