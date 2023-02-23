import React, { ReactNode } from 'react'
import { List as InnerList } from './List'

export const List: React.FC<{
  children?: ReactNode
  ordered: boolean
  [x: string]: unknown
}> = ({ children, ordered, attributes = {}, ...props }) => {
  return (
    <InnerList attributes={attributes} {...props} data={{ ordered }}>
      {children}
    </InnerList>
  )
}
