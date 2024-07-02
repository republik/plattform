import { css } from 'glamor'
import React, { Children } from 'react'
import { mUp } from '../TeaserFront/mediaQueries'
import { sansSerifRegular16, sansSerifRegular18 } from '../Typography/styles'
import { useColorContext } from '../Colors/useColorContext'

const styles = css({
  ...sansSerifRegular16,
  lineHeight: '22px',
  [mUp]: {
    ...sansSerifRegular18,
    lineHeight: '24px',
  },
})

type SubjectProps = {
  children: React.ReactNode
}

const Subject = ({ children }: SubjectProps) => {
  const [colorScheme] = useColorContext()
  const customStyles = css(styles, {
    '&::after': {
      content: Children.count(children) > 0 ? ' ' : undefined,
    },
  })
  return (
    <span {...customStyles} {...colorScheme.set('color', 'textSoft')}>
      {children}
    </span>
  )
}

export default Subject
