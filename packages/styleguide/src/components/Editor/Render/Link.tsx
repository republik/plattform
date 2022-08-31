import React from 'react'
import { useRenderContext } from './Context'

export const RenderLink: React.FC<any> = ({ children, ...props }) => {
  const { Link } = useRenderContext()
  return !Link ? children : <Link {...props}>{children}</Link>
}
