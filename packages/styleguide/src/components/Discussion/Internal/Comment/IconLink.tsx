import { IconDiscussion } from '@republik/icons'
import { css } from 'glamor'
import React, { useMemo } from 'react'
import { useColorContext } from '../../../Colors/useColorContext'
import { sansSerifMedium16 } from '../../../Typography/styles'

const DEFAULT_PADDING = 5

const styles = {
  link: css({
    display: 'inline-block',
    maxWidth: '100%',
    textDecoration: 'none',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    paddingLeft: DEFAULT_PADDING,
    paddingRight: DEFAULT_PADDING,
    ':first-child': {
      paddingLeft: 0,
    },
    ':last-child': {
      paddingRight: 0,
    },
    '@media print': {
      display: 'none',
    },
  }),
  text: css({
    display: 'inline-block',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    verticalAlign: 'middle',
    marginTop: -1,
    paddingLeft: 4,
    ...sansSerifMedium16,
  }),
  icon: css({
    display: 'inline-block',
    marginBottom: -2,
    verticalAlign: 'middle',
  }),
}

type IconLinkProps = {
  href?: string
  onClick?: React.ComponentProps<'a'>['onClick']
  style?: React.CSSProperties
  small?: boolean
  discussionCommentsCount: number
}

export const IconLink = React.forwardRef<HTMLAnchorElement, IconLinkProps>(
  ({ href, onClick, discussionCommentsCount, style, small }, ref) => {
    const [colorScheme] = useColorContext()
    const dimension = small ? 22 : 24
    const fontSize = small ? '15px' : undefined
    const lineHeight = small ? '20px' : undefined
    const patchedStyle = {
      marginLeft: small ? 0 : 20,
      ...style,
    }
    const linkStyleRule = useMemo(
      () =>
        css({
          color: colorScheme.getCSSColor('primary'),
          fill: colorScheme.getCSSColor('primary'),
          '@media (hover)': {
            ':hover': {
              color: colorScheme.getCSSColor('primaryHover'),
              fill: colorScheme.getCSSColor('primaryHover'),
            },
          },
        }),
      [colorScheme],
    )

    return (
      <a
        ref={ref}
        href={href}
        onClick={onClick}
        {...styles.link}
        {...linkStyleRule}
        style={patchedStyle}
      >
        <span {...styles.icon}>
          <IconDiscussion size={dimension} />
        </span>
        {discussionCommentsCount > 0 && (
          <span {...styles.text} style={{ fontSize, lineHeight }}>
            {discussionCommentsCount}
          </span>
        )}
      </a>
    )
  },
)

export default IconLink
