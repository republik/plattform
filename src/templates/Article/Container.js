import React from 'react'
import { useColorContext } from '../../components/Colors/useColorContext'

const ArticleContainer = ({ children }) => {
  const [colorScheme] = useColorContext()
  return (
    <div {...colorScheme.set('backgroundColor', 'default')}>{children}</div>
  )
}

export default ArticleContainer
