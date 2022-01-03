import React from 'react'
import PropTypes from 'prop-types'
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
import ActionsMenu, {
  ActionsMenuItemPropType
} from '../Internal/Comment/ActionsMenu'
import HeaderMetaLine from '../Internal/Comment/HeaderMetaLine'

const HIGHLIGHT_PADDING = 7

const styles = {
  root: css({
    display: 'grid',
    gap: '.5rem',
    [mUp]: {
      gap: '.5rem 1rem'
    }
  }),
  highlightedContainer: css({
    padding: HIGHLIGHT_PADDING,
    margin: `0 -${HIGHLIGHT_PADDING}px`
  }),
  withProfilePicture: css({
    gridTemplateAreas: `
      "portrait heading menu"
      "text text text"
      "actions vote vote"
    `,
    gridTemplateColumns: 'max-content 1fr max-content',
    gridTemplateRows: 'auto auto auto',
    [mUp]: {
      gridTemplateAreas: `
      "portrait heading menu"
      "portrait text text"
      "portrait actions vote"
    `,
      gridTemplateColumns: 'minmax(100px, max-content) 1fr max-content',
      gridTemplateRows: 'max-content auto auto'
    }
  }),
  withOutProfilePicture: css({
    gridTemplateAreas: `
      "heading menu"
      "text text"
      "actions vote"
    `,
    gridTemplateColumns: '1fr max-content',
    gridTemplateRows: 'auto auto auto auto'
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
    gridArea: 'actions',
    display: 'flex',
    alignItems: 'center'
  }),
  menuWrapper: css({
    gridArea: 'menu',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-start'
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
  menuItems = [],
  disableVoting = false,
  isHighlighted = false,
  Link
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
      {...(isHighlighted ? styles.highlightedContainer : {})}
      {...(isHighlighted ? colorScheme.set('backgroundColor', 'alert') : {})}
      data-comment-id={comment.id}
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
        <HeaderMetaLine t={t} comment={comment} Link={Link} />
      </div>
      <div {...styles.textWrapper}>{commentText}</div>
      <div {...styles.actionWrapper}>
        <IconButton
          title={t('styleguide/CommentActions/share')}
          Icon={ShareIcon}
          onClick={() => handleShare(comment)}
          size={20}
        />
      </div>
      {menuItems && (
        <div {...styles.menuWrapper}>
          <ActionsMenu items={menuItems} />
        </div>
      )}
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

StatementNode.propTypes = {
  comment: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  tagMappings: PropTypes.arrayOf(
    PropTypes.shape({
      tag: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired
    })
  ),
  actions: PropTypes.shape({
    handleUpVote: PropTypes.func.isRequired,
    handleDownVote: PropTypes.func.isRequired,
    handleUnVote: PropTypes.func.isRequired,
    handleShare: PropTypes.func.isRequired
  }),
  menuItems: PropTypes.arrayOf(ActionsMenuItemPropType),
  disableVoting: PropTypes.bool,
  isHighlighted: PropTypes.bool,
  Link: PropTypes.elementType
}
