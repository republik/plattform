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
    alignItems: 'center',
    margin: '7px 0 0 0',
    textDecoration: 'none',
    cursor: 'pointer',
    color: colors.text
  }),
  title: css({
    ...sansSerifMedium16,
    marginRight: 10
  })
}

const DebateHeader = ({ documentTitle, commentCount, href }) => {
  return (
    <a href={href} {...styles.header}>
      {documentTitle && <div {...styles.title}>{documentTitle}</div>}
      <IconLink discussionCommentsCount={commentCount} small />
    </a>
  )
}

export default DebateHeader

DebateHeader.propTypes = {
  documentTitle: PropTypes.string,
  commentCount: PropTypes.number,
  href: PropTypes.string
}
