import React from 'react'
import { css } from 'glamor'
import { fontStyles } from '../../Typography'
import { useMemo } from 'react'
import { getUniqueColorTagName } from './helpers/colorHelper'
import { VoteButtons } from '../Internal/Comment'
import { mUp } from '../../../theme/mediaQueries'
import { useColorContext } from '../../Colors/ColorContext'
import { stripTag } from './helpers/tagHelper'
import { renderCommentMdast } from '../Internal/Comment/render'
import IconButton from '../../IconButton'
import { ShareIcon } from '../../Icons'

const styles = {
  root: css({
    display: 'grid',

    gap: '.5rem',
    [mUp]: {
      gap: '.5rem 1rem'
    }
  }),
  withProfilePicture: css({
    gridTemplateAreas: `
      "portrait heading"
      "text text"
      "actions vote"
    `,
    gridTemplateColumns: 'max-content 1fr',
    gridTemplateRows: 'auto auto auto',
    [mUp]: {
      gridTemplateAreas: `
      "portrait heading ."
      "portrait text ."
      "portrait actions vote"
    `,
      gridTemplateColumns: 'minmax(100px, max-content) 1fr max-content',
      gridTemplateRows: 'max-content auto auto'
    }
  }),
  withOutProfilePicture: css({
    gridTemplateAreas: `
      "heading"
      "text"
      "vote"
    `,
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'auto auto auto',
    [mUp]: {
      gridTemplateAreas: `
      "heading ."
      "text vote"
    `,
      gridTemplateColumns: '1fr max-content',
      gridTemplateRows: 'max-content auto'
    }
  }),
  profilePicture: css({
    gridArea: 'portrait',
    display: 'block',
    width: 60,
    height: 60,
    [mUp]: {
      width: 100,
      height: 100
    }
  }),
  headingWrapper: css({
    gridArea: 'heading'
  }),
  textWrapper: css({
    gridArea: 'text'
  }),
  heading: css({
    margin: 0,
    ...fontStyles.sansSerifMedium22
  }),
  actionWrapper: css({
    gridArea: 'actions'
  }),
  voteWrapper: css({
    gridArea: 'vote',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  })
}

const StatementNode = ({
  comment,
  tagMappings = [],
  t,
  actions: { handleUpVote, handleDownVote, handleUnVote, handleShare },
  disableVoting = false
}) => {
  const [colorScheme] = useColorContext()

  const tag = comment.tags.length > 0 && comment.tags[0]

  const tagMapper = useMemo(() => {
    const tagMapping = tagMappings.find(m => stripTag(m.tag) === stripTag(tag))

    return (
      tagMapping || {
        text: '{user}'
      }
    )
  }, [comment, tag, tagMappings])

  const commentHeading = useMemo(
    () => tagMapper.text.replace('{user}', comment.displayAuthor.name),
    [comment, tagMapper]
  )

  const commentText = useMemo(() => renderCommentMdast(comment.content), [
    comment
  ])

  const hasProfilePicture = comment.displayAuthor?.profilePicture !== null

  return (
    <div
      {...styles.root}
      {...(hasProfilePicture
        ? styles.withProfilePicture
        : styles.withOutProfilePicture)}
    >
      {hasProfilePicture && (
        <img
          {...styles.profilePicture}
          alt={comment.displayAuthor.name}
          src={comment.displayAuthor.profilePicture}
        />
      )}
      <div {...styles.headingWrapper}>
        <p
          {...styles.heading}
          {...colorScheme.set('color', getUniqueColorTagName(tag))}
        >
          {commentHeading}
        </p>
      </div>
      <div {...styles.textWrapper}>{commentText}</div>
      <div {...styles.actionWrapper}>
        <IconButton
          title={t('styleguide/CommentActions/share')}
          Icon={ShareIcon}
          onClick={() => handleShare(comment)}
          size={20}
          noMargin
        />
      </div>
      <div {...styles.voteWrapper}>
        <VoteButtons
          t={t}
          disabled={disableVoting}
          comment={comment}
          handleUpVote={handleUpVote}
          handleDownVote={handleDownVote}
          handleUnVote={handleUnVote}
        />
      </div>
    </div>
  )
}

export default StatementNode
