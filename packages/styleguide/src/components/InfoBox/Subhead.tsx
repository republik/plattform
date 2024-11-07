import React from 'react'
import { sansSerifMedium15, sansSerifMedium18 } from '../Typography/styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { textAttributes } from './InfoBox'
import { convertStyleToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'

const styles = {
  text: css({
    ...convertStyleToRem(sansSerifMedium15),
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium18),
    },
  }),
}

type SubheadProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'p'>
}

export const Subhead = ({ children, attributes }: SubheadProps) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...attributes}
      {...colorScheme.set('color', 'text')}
      {...textAttributes}
      {...styles.text}
    >
      {children}
    </p>
  )
}

export default Subhead
