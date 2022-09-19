import React from 'react'
import { useColorContext } from '../../Colors/ColorContext'
import { Label } from '../../Typography'

const icons = {
  info: '📋',
  error: '❌',
}

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
        ...style,
      }}
      contentEditable={false}
    >
      <Label>
        <span style={{ marginRight: 5 }} role='img' aria-label='info'>
          {icons[type]}
        </span>{' '}
        <span
          {...colorScheme.set('color', type === 'error' ? 'error' : 'text')}
        >
          {text}
        </span>
      </Label>
    </span>
  )
}

export const ErrorMessage: React.FC<{
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
