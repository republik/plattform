import React, { Fragment, useMemo } from 'react'
import { css } from 'glamor'
import get from 'lodash/get'

import { mUp } from '../../theme/mediaQueries'
import { underline } from '../../lib/styleMixins'
import { inQuotes } from '../../lib/inQuotes'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useCurrentMinute } from '../../lib/useCurrentMinute'

import { serifRegular14, sansSerifMedium15 } from '../Typography/styles'
import { A } from '../Typography/'
import {
  CommentBodyParagraph,
  CommentBodyFeaturedText
} from '../CommentBody/web'
import { IconLink, Context, Header } from '../Discussion/Internal/Comment'
import RelativeTime from '../Discussion/Internal/Comment/RelativeTime'
import RawHtml from '../RawHtml/'
import { useColorContext } from '../Colors/ColorContext'
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
    paddingBottom: 40,
    textAlign: 'left'
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
    ...sansSerifMedium15,
    display: 'flex',
    justifyContent: 'space-between',
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
  }),
  imageContainer: css({
    [mUp]: {
      marginTop: 20
    }
  }),
  image: css({
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    width: '100%',
    [mUp]: {
      marginTop: 10
    }
  })
}

const DefaultLink = ({ children }) => children

export const CommentTeaser = ({
  t,
  Link = DefaultLink,
  onClick,
  highlighted,
  menu,
  children,
  ...comment
}) => {
  const {
    id,
    discussion,
    tags,
    parentIds,
    displayAuthor,
    preview,
    featuredText,
    highlights,
    createdAt
  } = comment
  const isDesktop = useMediaQuery(mUp)
  const [colorScheme] = useColorContext()
  const highlight = get(highlights, '[0].fragments[0]', '').trim()
  const commentCount = discussion?.comments?.totalCount

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
  const now = useCurrentMinute()
  const clock = {
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
        {...colorScheme.set('borderColor', 'divider')}
        {...(highlighted && colorScheme.set('backgroundColor', 'hover'))}
      >
        {displayAuthor && (
          <div {...styles.header}>
            <Header
              t={t}
              comment={{
                id,
                displayAuthor,
                createdAt
              }}
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
                {!!featuredText && (
                  <CommentBodyFeaturedText>
                    {inQuotes(featuredText)}
                  </CommentBodyFeaturedText>
                )}
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

        {discussion?.image && (
          <img
            style={{ maxWidth: '100%', maxHeight: '100%' }}
            src={discussion.image}
            alt={discussion?.title || ''}
            {...styles.image}
            {...colorScheme.set('borderColor', 'divider')}
          />
        )}

        <div {...styles.footer}>
          <div>
            {t.elements(
              `styleguide/CommentTeaser/${
                parentIds && parentIds.length
                  ? 'reply'
                  : commentCount
                  ? 'commentWithCount'
                  : 'comment'
              }/link`,
              {
                count: (
                  <Link
                    key={`link-count-${id}`}
                    comment={comment}
                    discussion={discussion}
                    passHref
                  >
                    <IconLink
                      discussionCommentsCount={commentCount}
                      small
                      style={{
                        marginTop: -2,
                        paddingRight: 0,
                        verticalAlign: 'top'
                      }}
                    />
                  </Link>
                ),
                link: (
                  <Link
                    key={`link-title-${id}`}
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
                <a {...styles.linkUnderline}>
                  <RelativeTime {...clock} date={createdAt} />
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
