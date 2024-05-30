import { css } from 'glamor'
import React from 'react'
import { sansSerifMedium14 } from '../Typography/styles'
import { useColorContext } from '../Colors/useColorContext'
import CarouselContext, { defaultValue } from './Context'

const styles = css({
  ...sansSerifMedium14,
  margin: '0 0 10px 0',
})

type FormatProps = {
  children: React.ReactNode
  color?: string
}

const Format = ({ children, color }: FormatProps) => {
  const context = React.useContext(CarouselContext)
  const mapping = context.color === defaultValue.color ? 'format' : undefined
  const textColor = color || context.color
  const [colorScheme] = useColorContext()
  return (
    <div {...colorScheme.set('color', textColor, mapping)} {...styles}>
      {children}
    </div>
  )
}

export default Format
