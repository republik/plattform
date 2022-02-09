import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import { IconLink } from '../Discussion/Internal/Comment'
import { sansSerifMedium16 } from '../Typography/styles'
import { useColorContext } from '../Colors/ColorContext'

const styles = {
  header: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  title: css({
    ...sansSerifMedium16,
    marginRight: 10,
    textDecoration: 'none',
  }),
}

const DebateHeader = React.forwardRef(
  ({ title, commentCount, href, onClick }, ref) => {
    const [colorScheme] = useColorContext()
    return (
      <div {...styles.header} ref={ref}>
        {title && (
          <a
            href={href}
            onClick={onClick}
            {...styles.title}
            {...colorScheme.set('color', 'text')}
          >
            {title}
          </a>
        )}
        <IconLink
          href={href}
          onClick={onClick}
          discussionCommentsCount={commentCount}
          small
        />
      </div>
    )
  },
)

export default DebateHeader

DebateHeader.propTypes = {
  title: PropTypes.string,
  commentCount: PropTypes.number,
  href: PropTypes.string,
}
