import { mediaQueries, plainLinkRule, fontStyles } from '@project-r/styleguide'
import { verlegerKampagneColors } from './config'
import { css } from 'glamor'
import NextLink from 'next/link'

const styles = {
  base: css({
    ...fontStyles.sansSerifBold,
    cursor: 'pointer',
    backgroundColor: verlegerKampagneColors.red,
    color: verlegerKampagneColors.yellow,
    borderRadius: 4,
    border: `1px solid ${verlegerKampagneColors.red}`,
    lineHeight: 1.2,
    '&:hover': {
      backgroundColor: verlegerKampagneColors.yellow,
      color: verlegerKampagneColors.red,
    },
    display: 'block',
    minWidth: 'max-content',
  }),
  inverted: css({
    backgroundColor: verlegerKampagneColors.yellow,
    color: verlegerKampagneColors.red,
    borderColor: verlegerKampagneColors.yellow,
    lineHeight: 1.2,
    '&:hover': {
      backgroundColor: verlegerKampagneColors.red,
      color: verlegerKampagneColors.yellow,
    },
  }),
  normal: css({
    padding: '0.5rem 0.75rem',
    fontSize: 19,
    borderWidth: 2,
  }),
  small: css({
    padding: '0.5rem 0.75rem',
    fontSize: 14,
  }),
}

export default function Button({
  children,
  small,
  inverted,
  ...props
}: React.ComponentProps<typeof NextLink> & {
  small?: boolean
  inverted?: boolean
}) {
  return (
    <NextLink
      {...plainLinkRule}
      {...styles.base}
      {...(inverted ? styles.inverted : {})}
      {...(small ? styles.small : styles.normal)}
      {...props}
    >
      {children}
    </NextLink>
  )
}
