import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
// import { ellipsize, underline } from '../../lib/styleMixins'
import colors from '../../theme/colors'
import {
  sansSerifRegular16,
  sansSerifRegular14,
  serifRegular15,
  sansSerifMedium16,
  serifBold28
} from '../Typography/styles'

import { Header as UserProfile } from '../Discussion/Internal/Comment'
import { ActiveDebateHeader, ActiveDebateComment } from '.'

const styles = {
  root: css({
    borderTop: `1px solid #C8C8C8`,
    margin: '0 0 30px 0',
    paddingTop: 10
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
  t,
  path,
  documentId, // Do we need this?
  documentTitle,
  commentCount,
  comments
  // preview,
  // commentCount,
  // displayAuthor,
  // timeago
  // onClick,
}) => {
  return (
    <div {...styles.root}>
      <ActiveDebateHeader
        t={t}
        documentTitle={documentTitle}
        commentCount={commentCount}
        href={path}
      />
      {comments.map(comment => (
        <React.Fragment key={comment.id}>
          <ActiveDebateComment
            t={t}
            id={comment.id}
            highlight={comment.highlight ? comment.highlight : undefined}
            preview={comment.preview}
          />
          <UserProfile
            t={t}
            comment={comment}
            // comment={{
            //   id: '50a17ba6-6864-4139-8c04-f53c02e19fe0',
            //   createdAt: '2000-01-01',
            //   updatedAt: new Date().toISOString(),
            //   parentIds: [],
            //   displayAuthor: {
            //     name: 'Queen Daenerys Stormborn of the House Targaryen',
            //     credential: {
            //       description: 'The rightful Queen of the Seven Kingdoms',
            //       verified: true
            //     }
            //   }
            // }}
            isExpanded={false}
            onToggle={() => {}}
          />
        </React.Fragment>
      ))}
    </div>
  )
}

export default DebateTeaser

DebateTeaser.propTypes = {
  t: PropTypes.func,
  path: PropTypes.string,
  documentId: PropTypes.string,
  documentTitle: PropTypes.string,
  comments: PropTypes.array

  // commentCount: PropTypes.number,
  // displayAuthor: PropTypes.shape({
  //   id: PropTypes.string,
  //   name: PropTypes.string,
  //   profilePicture: PropTypes.string
  // }),
  // timeago: PropTypes.string
}
// id="X"
// tags={["Kritik"]}
// createdAt="2019-01-01"
// preview={{
//   string: "Die Zeitungskäufe von Christoph Blocher, die Selbstideologisierung der NZZ, die Frankenstein-Monster-Strategie der Tamedia: Ehrlich gesagt wäre es uns lieber",
//   more: true
// }}
// timeago={isoString => 'gerade eben'}
// discussion={{
//   title: "Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie"
// }}
// t={t}
