import React from 'react'
import { sansSerifMedium16, sansSerifMedium19 } from '../Typography/styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { textAttributes } from './InfoBox'
import { convertStyleToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'

const styles = {
  text: css({
    margin: '0 0 8px 0',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    ...convertStyleToRem(sansSerifMedium16),
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium19),
      margin: '0 0 12px 0',
    },
  }),
}

type TitleProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'p'>
}

export const Title = ({ children, attributes }: TitleProps) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...attributes}
      {...textAttributes}
      {...styles.text}
      {...colorScheme.set('color', 'text')}
      {...colorScheme.set('borderColor', 'text')}
    >
      {children}
    </p>
  )
}

export default Title
