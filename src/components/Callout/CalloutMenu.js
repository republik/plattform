import React from 'react'
import Callout from './index'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'

const hasAncestor = (node, predicate) => {
  if (predicate(node)) {
    return true
  }
  if (node.parentNode) {
    return hasAncestor(node.parentNode, predicate)
  }
  return false
}

const CalloutMenu = ({
  children,
  Element,
  align,
  initiallyOpen,
  contentPaddingMobile,
  padded
}) => {
  const [showMenu, setMenu] = React.useState(initiallyOpen)
  const toggleRef = React.useRef()

  const handleClick = e => {
    if (!hasAncestor(e.target, node => node === toggleRef.current)) {
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

  return (
    <div
      {...(padded && styles.padded)}
      style={{ position: 'relative' }}
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
      <Element onClick={() => setMenu(!showMenu)} />
    </div>
  )
}

const styles = {
  padded: css({
    marginRight: 20,
    [mUp]: {
      marginRight: 24
    }
  })
}

export default CalloutMenu
