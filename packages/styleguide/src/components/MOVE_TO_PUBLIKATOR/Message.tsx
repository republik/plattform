import React, { ReactNode } from 'react'
import { useColorContext } from '../Colors/ColorContext'
import { Label } from '../Typography'

export const Message: React.FC<{
  text: string
  type?: 'error' | 'info'
  style?: any
}> = ({ text, style = {}, type = 'info' }) => {
  const [colorScheme] = useColorContext()
  return (
    <span
      style={{
        userSelect: 'none',
        marginBottom: 10,
        display: 'block',
        opacity: type === 'error' ? 1 : 0.5,
        ...style,
      }}
      contentEditable={false}
    >
      <Label>
        <span
          {...colorScheme.set(
            'color',
            type === 'error' ? 'flyerFormatText' : 'text',
          )}
        >
          {text}
        </span>
      </Label>
    </span>
  )
}

export const ErrorMessage: React.FC<{
  children?: ReactNode
  attributes: any
  error: string
}> = ({ error, attributes, children }) => (
  <span
    {...attributes}
    style={{ userSelect: 'none', display: 'block' }}
    contentEditable={false}
  >
    <Message text={error} type='error' />
    {children}
  </span>
)
