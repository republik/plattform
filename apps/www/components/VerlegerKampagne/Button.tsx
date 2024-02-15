import { mediaQueries, plainLinkRule } from '@project-r/styleguide'
import { verlegerKampagneColors } from './config'
import { css } from 'glamor'
import NextLink from 'next/link'

const styles = {
  base: css({
    backgroundColor: verlegerKampagneColors.red,
    color: verlegerKampagneColors.yellow,
    cursor: 'pointer',
    borderRadius: 4,
    border: `1px solid ${verlegerKampagneColors.yellow}`,
    fontWeight: 500,
    lineHeight: 1.2,
    '&:hover': {
      backgroundColor: verlegerKampagneColors.darkRed,
    },
    display: 'block',
    minWidth: 'max-content',
  }),
  normal: css({
    fontSize: 14,
    padding: '10px',
    [mediaQueries.mUp]: {
      fontSize: 17,
    },
  }),
  small: css({
    fontSize: 12,
    padding: '6px 10px',
    [mediaQueries.mUp]: {
      fontSize: 14,
      padding: '10px 20px',
    },
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
