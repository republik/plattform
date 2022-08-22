import React from 'react'
import { List as InnerList } from './List'

export const List: React.FC<{
  ordered: boolean
  attributes: any
  [x: string]: unknown
}> = ({ children, ordered, attributes = {}, ...props }) => {
  const { ref, ...attrs } = attributes
  return (
    <InnerList {...attrs} {...props} data={{ ordered }}>
      {children}
    </InnerList>
  )
}
