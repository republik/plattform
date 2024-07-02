import React from 'react'
import { sansSerifRegular12, sansSerifRegular15 } from '../Typography/styles'
import { css, merge } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { PADDING } from '../Center'
import { convertStyleToRem, pxToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'

const styles = {
  caption: css({
    margin: '5px auto 0 auto',
    width: '100%',
    maxWidth: `calc(100vw - ${PADDING * 2}px)`,
    ...convertStyleToRem(sansSerifRegular12),
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular15),
      lineHeight: pxToRem('18px'),
    },
  }),
  groupCaption: css({
    marginTop: -10,
    marginBottom: 15,
  }),
}

type CaptionProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'figcaption'>
  groupCaption?: boolean
}

export const Caption = ({
  children,
  attributes,
  groupCaption,
}: CaptionProps) => {
  const [colorScheme] = useColorContext()

  return (
    <figcaption
      {...attributes}
      {...merge(styles.caption, groupCaption && styles.groupCaption)}
      {...colorScheme.set('color', 'text')}
    >
      {children}
    </figcaption>
  )
}

export default Caption
