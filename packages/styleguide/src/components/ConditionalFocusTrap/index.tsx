import React, { Children, useEffect } from 'react'
import FocusTrap, { Props as FocusTrapProps } from 'focus-trap-react'

type ConditionalFocusTrapProps = {
  // defines if the focusTrap should be rendered
  shouldTrap?: boolean
} & FocusTrapProps

/**
 * ConditionalFocusTrap is a wrapper around FocusTrap that only renders
 * the FocusTrap if the `shouldTrap` prop is true.
 * @param props - props to pass to FocusTrap and shouldTrap property
 */
export const ConditionalFocusTrap = ({
  children,
  shouldTrap,
  ...focusTrapProps
}: ConditionalFocusTrapProps) => {
  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development'
    if (isDev && Children.toArray(children).length > 1) {
      throw new Error('FocusTrap requires exactly one child element')
    }
  }, [children])

  if (shouldTrap) {
    return <FocusTrap {...focusTrapProps}>{children}</FocusTrap>
  }
  return <>{children}</>
}
