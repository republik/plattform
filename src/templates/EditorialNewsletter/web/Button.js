import React from 'react'
import Button from '../../../components/Button'

export default ({ children, href, title, target, primary, block, attributes }) => (
  <>
    <Button
      href={href}
      title={title}
      target={target}
      primary={primary}
      block={block}
      {...attributes}
      spacedOut>
      {children}
    </Button>
    {!block && <br />}
  </>
)
