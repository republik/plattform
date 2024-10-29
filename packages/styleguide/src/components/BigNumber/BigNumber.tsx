import React from 'react'
import { css } from 'glamor'

const styles = {
  container: css({
    border: '1px solid red'
  }),
}

const BigNumber = ({
  children,
  attributes,
  ...props
}) => {
  return (
    <div
      {...attributes}
      {...props}
      {...styles.container}
    >
      {children}
    </div>
  )
}

export default BigNumber
