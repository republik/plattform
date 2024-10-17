import React, { ComponentType, Fragment, useMemo } from 'react'
import { css } from 'glamor'
import get from 'lodash/get'

import { mUp } from '../../theme/mediaQueries'
import { inQuotes } from '../../lib/inQuotes'
import { useMediaQuery } from '../../lib/useMediaQuery'

import { serifRegular14 } from '../Typography/styles'
import {
  CommentBodyParagraph,
  CommentBodyFeaturedText,
} from '../CommentBody/web'
import { Context, Header } from '../Discussion/Internal/Comment'
import RawHtml from '../RawHtml'
import { useColorContext } from '../Colors/ColorContext'
import { DiscussionContext } from '../Discussion/DiscussionContext'
import DiscussionFooter from './DiscussionFooter'
import { Formatter } from '../../lib/translate'
import {
  CommentLinkProps,
  DefaultCommentLink,
} from '../Discussion/Internal/Comment/CommentLink'
import {
  DisplayAuthor,
  Comment as CommentType,
} from '../Discussion/Internal/Comment/types'

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

type CommentTeaserProps = {
  t: Formatter
  CommentLink: ComponentType<CommentLinkProps>
  onClick?: () => void
  highlighted?: boolean
  menu?: React.ReactNode
  children: React.ReactNode
  id: string
  discussion: {
    image: string
    title: string
  }
  tags: string[]
  displayAuthor: DisplayAuthor
  preview: {
    string: string
    more: boolean
  }
  featuredText: string
  highlights: {
    fragments: string[]
  }[]
  createdAt: string
} & CommentType

export const CommentTeaser = ({
  t,
  CommentLink = DefaultCommentLink,
  onClick,
  highlighted,
  menu,
  children,
  ...comment
}: CommentTeaserProps) => {
  const {
    id,
    discussion,
    tags,
    displayAuthor,
    preview,
    featuredText,
    highlights,
    createdAt,
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
              // menu={menu}
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
                        __html: highlight,
                      }}
                    />
                    {!endsWithPunctuation && <Fragment>&nbsp;…</Fragment>}
                  </Fragment>
                )}
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

        <DiscussionFooter
          comment={comment as CommentType}
          t={t}
          CommentLink={CommentLink}
        />
      </div>
    </DiscussionContext.Provider>
  )
}

export default CommentTeaser
