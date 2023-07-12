import React from 'react'
import { useColorContext } from '../../components/Colors/useColorContext'
import ErrorBoundary from '../../components/ErrorBoundary'
import { Figure } from '../../components/Figure'

const ArticleContainer = ({ children }) => {
  const [colorScheme] = useColorContext()
  return (
    <div {...colorScheme.set('backgroundColor', 'default')}>{children}</div>
  )
}

export const ResizableContainer = ({
  children,
  showException,
  raw,
  size,
  attributes,
  t,
}) => {
  const content = (
    <ErrorBoundary
      showException={showException}
      failureMessage={t('styleguide/DynamicComponent/error')}
    >
      {children}
    </ErrorBoundary>
  )

  if (raw) {
    return content
  }

  return (
    <Figure size={size} attributes={attributes}>
      {content}
    </Figure>
  )
}

export default ArticleContainer
