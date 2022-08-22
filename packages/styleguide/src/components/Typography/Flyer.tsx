import React from 'react'
import { useColorContext } from '../Colors/ColorContext'

export const H1 = ({ children, attributes, ...props }) => (
  <h1
    {...attributes}
    {...props}
    style={{
      fontFamily: 'Druk Text Wide Trial',
      fontStyle: 'Medium',
      fontSize: 60,
      textAlign: 'center',
      marginBottom: 50,
    }}
  >
    {children}
  </h1>
)

export const H2 = ({ children, attributes, ...props }) => (
  <h2
    {...attributes}
    {...props}
    style={{
      fontFamily: 'Druk Text Wide Trial',
      fontStyle: 'Medium',
      fontSize: 40,
      paddingBottom: 40,
    }}
  >
    {children}
  </h2>
)

export const H3 = ({ children, attributes, ...props }) => (
  <h3
    {...attributes}
    {...props}
    style={{
      color: '#D50032',
      fontFamily: 'Druk Text Wide Trial',
      fontStyle: 'Medium',
      fontSize: 20,
      textTransform: 'uppercase',
    }}
  >
    {children}
  </h3>
)

export const P = ({ children, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...props}
      style={{
        fontFamily: 'GT America',
        fontWeight: 400,
        fontSize: 24,
        marginBottom: 20,
        ...props.style,
      }}
      {...colorScheme.set('color', 'text')}
    >
      {children}
    </p>
  )
}

export const MetaP = ({ children, attributes, ...props }) => (
  <p
    {...attributes}
    {...props}
    style={{
      color: '#0E755A',
      fontWeight: 700,
      fontFamily: 'GT America',
      fontSize: 30,
      paddingBottom: 90,
    }}
  >
    {children}
  </p>
)

export const Small = ({ children, attributes, ...props }) => (
  <p
    {...attributes}
    {...props}
    style={{
      fontWeight: 400,
      fontFamily: 'GT America',
      fontSize: 26,
      textAlign: 'center',
    }}
  >
    {children}
  </p>
)
