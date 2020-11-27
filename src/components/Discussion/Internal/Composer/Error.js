import React from 'react'
import { css } from 'glamor'
import { sansSerifRegular16 } from '../../../Typography/styles'
import { convertStyleToRem } from '../../../Typography/utils'
import { useColorContext } from '../../../Colors/useColorContext'

const styles = {
  root: css({
    ...convertStyleToRem(sansSerifRegular16),
    marginTop: 12
  })
}

export const Error = ({ children }) => {
  const [colorScheme] = useColorContext()
  return (
    <div {...styles.root} {...colorScheme.set('color', 'error')}>
      {children}
    </div>
  )
}
