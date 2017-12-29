import React from 'react'
import { Figure } from '../../../components/Figure'

const StyledFigure = ({ children }) => (
  <Figure
    attributes={{
      style: {
        borderTop: '1px solid #555',
        paddingTop: '13px',
        marginBottom: '30px'
      }
    }}
  >
    {children}
  </Figure>
)

export default StyledFigure
