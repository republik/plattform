import { mediaQueries, plainLinkRule, fontStyles } from '@project-r/styleguide'
import { verlegerKampagneColors } from './config'
import { css } from 'glamor'
import NextLink from 'next/link'

const styles = {
  base: css({
    ...fontStyles.sansSerifBold,
    cursor: 'pointer',
    backgroundColor: verlegerKampagneColors.yellow,
    color: verlegerKampagneColors.red,
    borderRadius: 4,
    border: `1px solid ${verlegerKampagneColors.yellow}`,
    lineHeight: 1.2,
    '&:hover': {
      backgroundColor: verlegerKampagneColors.red,
      color: verlegerKampagneColors.yellow,
    },
    display: 'block',
    minWidth: 'max-content',
  }),
  normal: css({
    padding: '0.5rem 0.75rem',
    fontSize: 19,
  }),
  small: css({
    padding: '0.5rem 0.75rem',
    fontSize: 14,
  }),
}

export default function Button({
  children,
  small,
  ...props
}: React.ComponentProps<typeof NextLink> & { small?: boolean }) {
  return (
    <NextLink
      {...plainLinkRule}
      {...styles.base}
      {...(small ? styles.small : styles.normal)}
      {...props}
    >
      {children}
    </NextLink>
  )
}
