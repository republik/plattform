import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import { IconLink } from '../Discussion/Internal/Comment'
import { sansSerifMedium16 } from '../Typography/styles'
import colors from '../../theme/colors'

const styles = {
  header: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }),
  title: css({
    ...sansSerifMedium16,
    marginRight: 10,
    color: colors.text,
    textDecoration: 'none'
  })
}

const DebateHeader = ({ title, commentCount, href, onClick }) => {
  return (
    <div {...styles.header}>
      {title && <a href={href} onClick={onClick} {...styles.title}>{title}</a>}
      <IconLink href={href} onClick={onClick} discussionCommentsCount={commentCount} small />
    </div>
  )
}

export default DebateHeader

DebateHeader.propTypes = {
  title: PropTypes.string,
  commentCount: PropTypes.number,
  href: PropTypes.string
}
