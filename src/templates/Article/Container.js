import React from 'react'
import { useColorContext } from '../../components/Colors/useColorContext'

const ArticleContainer = ({ children }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      style={{
        backgroundColor: colorScheme.containerBg
      }}
    >
      {children}
    </div>
  )
}

export default ArticleContainer
