import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
// import { ellipsize, underline } from '../../lib/styleMixins'
import colors from '../../theme/colors'
import { IconLink } from '../Discussion/Internal/Comment'
import RawHtml from '../RawHtml/'
import {
  sansSerifRegular16,
  sansSerifRegular14,
  serifRegular15,
  sansSerifMedium16
} from '../Typography/styles'

const styles = {
  root: css({
    borderTop: `1px solid ${colors.text}`,
    margin: '0 0 40px 0',
    paddingTop: 10
  }),
  header: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    margin: '7px 0 0 0'
  }),
  title: css({
    ...sansSerifRegular16
  }),
  body: css({
    ...serifRegular15,
    color: colors.text,
    margin: '12px 0'
  }),

  footer: css({
    ...sansSerifRegular14,
    display: 'flex',
    justifyContent: 'flex-start'
  }),
  profilePicture: css({
    display: 'block',
    width: `40px`,
    flex: `0 0 40px`,
    height: `40px`,
    marginRight: '8px'
  }),
  commentMeta: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'flex-start'
  }),
  authorName: css({
    flexShrink: 0,
    paddingLeft: 10,
    color: colors.text,
    ...sansSerifMedium16
  }),
  timeago: css({
    color: colors.lightText,
    flexShrink: 0,
    paddingLeft: 10
  })
}

export const DebateTeaser = ({
  href,
  onClick,
  highlight,
  documentTitle,
  preview,
  commentCount,
  displayAuthor,
  timeago
}) => {
  const authorName = displayAuthor.name
    ? displayAuthor.name
    : 'anonymous author'
  return (
    <a {...styles.root} href={href} onClick={onClick}>
      <div {...styles.header}>
        {
          <React.Fragment>
            {documentTitle && <div {...styles.title}>{documentTitle}</div>}
            <IconLink discussionCommentsCount={commentCount} small />
          </React.Fragment>
        }
      </div>
      {preview && (
        <div {...styles.body}>
          <React.Fragment>
            <RawHtml
              dangerouslySetInnerHTML={{
                __html: preview.string
              }}
            />
            {/* {!endsWithPunctuation && <Fragment>&nbsp;…</Fragment>} */}
          </React.Fragment>
        </div>
      )}
      {displayAuthor && (
        <div {...styles.footer}>
          {displayAuthor.profilePicture && (
            // <links.Profile displayAuthor={displayAuthor} passHref>
            <a {...styles.link}>
              <img
                {...styles.profilePicture}
                src={displayAuthor.profilePicture}
                alt={`profile picture of this comment's author, ${authorName}`}
              />
            </a>
            // </links.Profile>
          )}
          <div {...styles.commentMeta}>
            {displayAuthor.name && (
              <div {...styles.authorName}>{displayAuthor.name}</div>
            )}
            {timeago && <div {...styles.timeago}>{timeago}</div>}
          </div>
        </div>
      )}
    </a>
  )
}

export default DebateTeaser

DebateTeaser.propTypes = {
  href: PropTypes.string,
  highlight: PropTypes.string,
  documentTitle: PropTypes.string,
  preview: PropTypes.shape({
    string: PropTypes.string,
    more: PropTypes.bool
  }),
  commentCount: PropTypes.number,
  displayAuthor: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    profilePicture: PropTypes.string
  }),
  timeago: PropTypes.string
}
