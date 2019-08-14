import { css } from 'glamor'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import colors from '../../../../theme/colors'
import { sansSerifMedium16 } from '../../../Typography/styles'

const DEFAULT_PADDING = 5

const styles = {
  link: css({
    color: 'inherit',
    display: 'inline-block',
    maxWidth: '100%',
    textDecoration: 'none',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    paddingLeft: DEFAULT_PADDING,
    paddingRight: DEFAULT_PADDING,
    '@media(hover)': {
      '[href]:hover > *': {
        opacity: 0.6
      }
    },
    ':first-child': {
      paddingLeft: 0
    },
    ':last-child': {
      paddingRight: 0
    },
    '@media print': {
      display: 'none'
    }
  }),
  text: css({
    display: 'inline-block',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    verticalAlign: 'middle',
    color: colors.primary,
    marginTop: -1,
    paddingLeft: 4,
    ...sansSerifMedium16
  }),
  icon: css({
    display: 'inline-block',
    marginBottom: -2,
    verticalAlign: 'middle'
  })
}

export class IconLink extends Component {
  render() {
    const { href, onClick, discussionCommentsCount, style, small } = this.props
    const size = small ? 22 : 24
    const fontSize = small ? '15px' : undefined
    const lineHeight = small ? '20px' : undefined
    const patchedStyle = {
      marginLeft: small ? 0 : 20,
      ...style
    }

    return (
      <a href={href} onClick={onClick} {...styles.link} style={patchedStyle}>
        <span {...styles.icon}>
          <Icon size={size} fill={colors.primary} />
        </span>
        {discussionCommentsCount > 0 && (
          <span
            {...styles.text}
            {...styles.text}
            style={{ fontSize, lineHeight }}
          >
            {discussionCommentsCount}
          </span>
        )}
      </a>
    )
  }
}

IconLink.propTypes = {
  href: PropTypes.string,
  onClick: PropTypes.func,
  discussionCommentsCount: PropTypes.number,
  style: PropTypes.object,
  small: PropTypes.bool
}

const Icon = ({ size, fill }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ verticalAlign: 'middle' }}
  >
    <path
      d="M9,22A1,1 0 0,1 8,21V18H4A2,2 0 0,1 2,16V4C2,2.89 2.9,2 4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H13.9L10.2,21.71C10,21.9 9.75,22 9.5,22V22H9M10,16V19.08L13.08,16H20V4H4V16H10Z"
      fill={fill}
    />
  </svg>
)
