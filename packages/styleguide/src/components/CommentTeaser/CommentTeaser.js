import React, { Fragment, useMemo } from 'react'
import { css } from 'glamor'

import { mUp } from '../../theme/mediaQueries'
import { inQuotes } from '../../lib/inQuotes'
import { useMediaQuery } from '../../lib/useMediaQuery'

import { serifRegular14 } from '../Typography/styles'
import { CommentBodyParagraph, CommentBodyFeaturedText } from '../CommentBody'
import { Context, Header } from '../Discussion/Internal/Comment'
import { useColorContext } from '../Colors/ColorContext'
import { DiscussionContext } from '../Discussion/DiscussionContext'
import DiscussionFooter from './DiscussionFooter'

const styles = {
  root: css({
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    margin: 0,
    paddingTop: 10,
    paddingBottom: 40,
    textAlign: 'left',
  }),
  header: css({
    marginBottom: 10,
  }),
  body: css({
    ...serifRegular14,
    wordWrap: 'break-word',
    margin: '10px 0',
  }),
  link: css({
    color: 'inherit',
    textDecoration: 'none',
    cursor: 'pointer',
  }),
  image: css({
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    width: '100%',
    [mUp]: {
      marginTop: 10,
    },
  }),
}

const DefaultLink = ({ children }) => children

export const CommentTeaser = ({
  t,
  CommentLink = DefaultLink,
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
    displayAuthor,
    preview,
    featuredText,
    highlightedSearchResult,
    createdAt,
  } = comment
  const isDesktop = useMediaQuery(mUp)
  const [colorScheme] = useColorContext()

  // assuming frontend currently supports only one tag.
  const tag = tags && !!tags.length && tags[0]

  /*
   * A reduced version of DiscussionContext value, just enough so we can render
   * the Comment Header component.
   */
  const clock = {
    t,
    isDesktop,
  }

  const discussionContextValue = {
    discussion,
    clock,
    CommentLink,
  }

  const highlightEMRule = useMemo(
    () =>
      css({
        '& em': {
          background: colorScheme.getCSSColor('alert'),
          fontStyle: 'normal',
        },
      }),
    [colorScheme],
  )
  return (
    <DiscussionContext.Provider value={discussionContextValue}>
      <div
        id={id}
        {...styles.root}
        {...colorScheme.set('borderColor', 'divider')}
        {...(highlighted && colorScheme.set('backgroundColor', 'alert'))}
      >
        {displayAuthor && (
          <div {...styles.header}>
            <Header
              t={t}
              comment={{
                id,
                displayAuthor,
                createdAt,
              }}
              menu={menu}
              CommentLink={CommentLink}
            />
          </div>
        )}
        {tag && (
          <Context
            title={
              <CommentLink comment={comment} discussion={discussion} passHref>
                <a {...styles.link} {...highlightEMRule}>
                  {tag}
                </a>
              </CommentLink>
            }
          />
        )}
        <div
          {...styles.body}
          {...colorScheme.set('color', 'text')}
          style={{ marginTop: displayAuthor || tag ? undefined : 0 }}
        >
          <CommentBodyParagraph>
            <CommentLink comment={comment} discussion={discussion} passHref>
              <a {...styles.link} {...highlightEMRule}>
                {!!featuredText && (
                  <CommentBodyFeaturedText>
                    {inQuotes(featuredText)}
                  </CommentBodyFeaturedText>
                )}
                {!!preview && !highlightedSearchResult && (
                  <Fragment>
                    {preview.string}
                    {!!preview.more && <Fragment>&nbsp;…</Fragment>}
                  </Fragment>
                )}
                {!!highlightedSearchResult && highlightedSearchResult}
              </a>
            </CommentLink>
          </CommentBodyParagraph>
        </div>

        {discussion?.image && (
          <CommentLink comment={comment} discussion={discussion} passHref>
            <a {...styles.link}>
              <img
                style={{ maxWidth: '100%', maxHeight: '100%' }}
                src={discussion.image}
                alt={discussion?.title || ''}
                {...styles.image}
                {...colorScheme.set('borderColor', 'divider')}
              />
            </a>
          </CommentLink>
        )}

        <DiscussionFooter comment={comment} t={t} CommentLink={CommentLink} />
      </div>
    </DiscussionContext.Provider>
  )
}

export default CommentTeaser
