import React from 'react'
import { sansSerifRegular14, sansSerifRegular15 } from '../Typography/styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { convertStyleToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/ColorContext'

const styles = {
  cite: css({
    display: 'block',
    ...convertStyleToRem(sansSerifRegular14),
    marginTop: '18px',
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular15),
      marginTop: '21px',
    },
    fontStyle: 'normal',
  }),
}

type SourceProps = {
  children: React.ReactNode
  attributes?: React.HTMLAttributes<HTMLParagraphElement>
}

export const Source = ({ children, attributes }: SourceProps) => {
  const [colorScheme] = useColorContext()
  return (
    <cite
      {...styles.cite}
      {...attributes}
      {...colorScheme.set('color', 'text')}
    >
      {children}
    </cite>
  )
}

export default Source
