import React from 'react'
import { Figure } from '../../../components/Figure'

const StyledFigure = ({ children, plain }) => (
  <Figure
    attributes={{
      style: {
        borderTop: plain ? undefined : '1px solid #555',
        paddingTop: plain ? undefined : '13px',
        marginBottom: '30px',
      },
    }}
  >
    {children}
  </Figure>
)

export default StyledFigure
