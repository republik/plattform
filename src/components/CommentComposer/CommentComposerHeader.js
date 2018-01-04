import React from 'react'
import {css} from 'glamor'
import MdEdit from 'react-icons/lib/md/edit'
import MdCheck from 'react-icons/lib/md/check'
import colors from '../../theme/colors'
import {sansSerifMedium16, sansSerifRegular14} from '../Typography/styles'
import {ellipsize} from '../../lib/styleMixins'

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center',
    background: colors.secondaryBg,
    padding: '12px'
  }),
  profilePicture: css({
    display: 'block',
    width: '40px',
    height: '40px',
    marginRight: 10
  }),
  meta: css({
    flex: 1,
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
  }),
  name: css({
    ...sansSerifMedium16,
    lineHeight: '20px',
    color: colors.text,
    ...ellipsize
  }),
  description: css({
    ...sansSerifRegular14,
    lineHeight: '20px',
    color: colors.lightText,
    display: 'flex',
    alignItems: 'center'
  }),
  descriptionText: css({
    ...ellipsize,
  }),
  verifiedDescription: css({
    color: colors.text
  }),
  verifiedCheck: css({
    flexShrink: 0,
    display: 'inline-block',
    marginLeft: 4,
    marginTop: -2
  }),
  actionButton: css({
    outline: 'none',
    WebkitAppearance: 'none',
    background: 'transparent',
    border: 'none',
    flexShrink: 0,
    alignSelf: 'stretch',
    margin: '-12px -12px -12px 0',
    padding: '15px 20px',
    fontSize: '24px',
    cursor: 'pointer',
  })
}

const CommentComposerHeader = ({profilePicture, name, credential, onClick}) => (
  <div {...styles.root}>
    {profilePicture && <img
      {...styles.profilePicture}
      src={profilePicture}
      alt=''
    />}
    <div {...styles.meta}>
      <div {...styles.name}>
        {name}
      </div>
      {credential && <div {...styles.description} {...(credential.verified ? styles.verifiedDescription : {})}>
        <div {...styles.descriptionText}>{credential.description}</div>
        {credential.verified && <MdCheck {...styles.verifiedCheck} />}
      </div>}
    </div>
    <button {...styles.actionButton} onClick={onClick}>
      <MdEdit />
    </button>
  </div>
)

export default CommentComposerHeader
