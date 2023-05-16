import React from 'react'
import type { ComponentProps } from 'react'

export interface ButtonProps extends ComponentProps<'button'> {
  children: React.ReactNode
  color?: string
}

export function Button({ children, color, ...props }: ButtonProps) {
  return (
    <button {...props} style={color ? { backgroundColor: color } : undefined}>
      {children}
    </button>
  )
}
