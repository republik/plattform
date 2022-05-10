import React, { useMemo } from 'react'
import { css } from 'glamor'
import { TwitterIcon } from '../Icons'
import { mUp } from '../../theme/mediaQueries'
import { sansSerifMedium16, sansSerifRegular14 } from '../Typography/styles'
import { ellipsize } from '../../lib/styleMixins'
import { timeFormat } from '../../lib/timeFormat'
import { convertStyleToRem, pxToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'

export const profilePictureSize = 40
export const profilePictureMargin = 10
const profilePictureBorderSize = 5
const profilePictureBoxSize = profilePictureSize + 2 * profilePictureBorderSize

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  }),
  profilePicture: css({
    display: 'block',
    width: `${pxToRem(profilePictureBoxSize)}`,
    flexGrow: 0,
    flexShrink: 0,
    height: `${pxToRem(profilePictureBoxSize)}`,
    margin: `${pxToRem(-profilePictureBorderSize)} ${pxToRem(
      -profilePictureBorderSize + profilePictureMargin,
    )} ${pxToRem(-profilePictureBorderSize)} ${pxToRem(
      -profilePictureBorderSize,
    )}`,
    borderWidth: `${pxToRem(profilePictureBorderSize)}`,
    borderStyle: 'solid',
  }),
  meta: css({
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: `calc(100% - ${profilePictureSize + profilePictureMargin}px)`,
  }),
  name: css({
    ...convertStyleToRem(sansSerifMedium16),
    lineHeight: pxToRem('20px'),
    color: 'inherit',
    display: 'flex',
    alignItems: 'center',
    paddingRight: '15px',
  }),
  nameText: css({
    ...ellipsize,
  }),
  subline: css({
    ...convertStyleToRem(sansSerifRegular14),
    lineHeight: pxToRem('20px'),
    display: 'flex',
    alignItems: 'center',
  }),
  sublineText: css({
    ...ellipsize,
    overflow: 'hidden',
  }),
  icon: css({
    position: 'absolute',
    right: 0,
    top: '2px',
    flexShrink: 0,
    display: 'inline-block',
    marginLeft: 4,
    fontSize: pxToRem('17px'),
    [mUp]: {
      fontSize: pxToRem('24px'),
      top: '8px',
    },
  }),
  link: css({
    textDecoration: 'none',
    color: 'inherit',
  }),
}

const dateFormat = timeFormat('%d. %B %Y')

const Link = ({ href, children }) => {
  const [colorScheme] = useColorContext()
  const hoverRule = useMemo(
    () =>
      css({
        '@media (hover)': {
          ':hover': {
            color: colorScheme.getCSSColor('textSoft'),
          },
        },
      }),
    [colorScheme],
  )
  return (
    <a href={href} {...styles.link} {...hoverRule}>
      {children}
    </a>
  )
}

const UserLink = ({ handle, children }) => (
  <Link href={`https://twitter.com/${handle}`}>{children}</Link>
)

export const Header = ({ url, userProfileImageUrl, name, handle, date }) => {
  const cleanHandle = handle && handle.replace('@', '')
  const [colorScheme] = useColorContext()
  return (
    <div {...styles.root} {...colorScheme.set('color', 'text')}>
      <UserLink handle={cleanHandle}>
        <img
          {...styles.profilePicture}
          {...colorScheme.set('borderColor', 'default')}
          src={userProfileImageUrl}
          alt=''
        />
      </UserLink>
      <Link href={url}>
        <TwitterIcon
          {...styles.icon}
          {...colorScheme.set('color', 'divider')}
        />
      </Link>
      <div {...styles.meta}>
        <div {...styles.name}>
          <div {...styles.nameText}>
            <UserLink handle={cleanHandle}>{name}</UserLink>
          </div>
        </div>
        <div {...styles.subline}>
          <div {...styles.sublineText}>
            <UserLink handle={cleanHandle}>@{cleanHandle}</UserLink>,{' '}
            <Link href={url}>{dateFormat(date)}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
