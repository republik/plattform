import React from 'react'
import { CustomDescendant } from '../../custom-types'

const SlateRender: React.FC<{
  value: CustomDescendant[]
}> = ({ value }) => {
  return (
    <div>
      <pre>{JSON.stringify(value)}</pre>
    </div>
  )
}
export default SlateRender
