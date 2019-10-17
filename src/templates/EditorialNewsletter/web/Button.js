import React from 'react'
import Button from '../../../components/Button'

export default ({ children, href, title, target, primary, attributes }) => (
  <>
    <Button href={href} title={title} target={target} primary={primary} {...attributes} spacedOut>
      {children}
    </Button>
    <br/>
  </>
)