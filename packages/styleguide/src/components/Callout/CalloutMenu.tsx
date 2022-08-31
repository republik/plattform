import React from 'react'
import Callout from './index'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'

export const hasAncestor = (node, predicate) => {
  if (predicate(node)) {
    return true
  }
  if (node.parentNode) {
    return hasAncestor(node.parentNode, predicate)
  }
  return false
}

const styles = {
  padded: css({
    marginRight: 20,
    [mUp]: {
      marginRight: 24,
    },
  }),
}

type Props<ElementProps = any> = {
  children?: React.ReactNode
  Element: React.ElementType<ElementProps>
  elementProps: ElementProps
  align?: 'left' | 'right'
  initiallyOpen?: boolean
  contentPaddingMobile?: string
  padded?: boolean
  attributes?: any
}

const CalloutMenu = ({
  children,
  Element,
  elementProps,
  align,
  initiallyOpen,
  contentPaddingMobile,
  padded,
  attributes,
}: Props) => {
  const [showMenu, setMenu] = React.useState(initiallyOpen)
  const toggleRef = React.useRef()

  const handleClick = (e) => {
    if (!hasAncestor(e.target, (node) => node === toggleRef.current)) {
      setMenu(false)
    }
  }

  React.useEffect(() => {
    if (!showMenu) return
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [showMenu])

  // wrapping div needed for robust positioning of <Callout />
  return (
    <span
      {...(padded && styles.padded)}
      {...attributes}
      style={{ position: 'relative', display: 'block' }}
      ref={toggleRef}
    >
      {showMenu && (
        <Callout
          onClose={() => setMenu(false)}
          align={align}
          contentPaddingMobile={contentPaddingMobile}
        >
          {children}
        </Callout>
      )}
      <Element
        {...elementProps}
        onMouseDown={(e) => {
          e.preventDefault()
          setMenu(!showMenu)
        }}
      />
    </span>
  )
}

export default CalloutMenu
