import React from 'react'
import { css } from 'glamor'
import { serifRegular23, serifTitle38 } from '../Typography/styles'
import { useRenderContext } from '../Editor/Render/Context'
import { plainLinkRule } from '../Typography'

export const ArticleTextContainer: React.FC<{
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, ...props }) => {
  return (
    <div
      {...attributes}
      {...props}
      style={{ textAlign: 'center', padding: '30px 30px 10px' }}
    >
      {children}
    </div>
  )
}

export const ArticleTitle: React.FC<{
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, color, backgroundColor, ...props }) => {
  return (
    <h4 {...attributes} {...props} style={{ margin: 0 }} {...css(serifTitle38)}>
      {children}
    </h4>
  )
}

export const ArticleLead: React.FC<{
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, color, backgroundColor, ...props }) => {
  return (
    <p {...attributes} {...props} {...css(serifRegular23)}>
      {children}
    </p>
  )
}

export const ArticlePreview: React.FC<{
  attributes: any
  color: string
  backgroundColor: string
  href?: string
  [x: string]: unknown
}> = ({ children, attributes, color, backgroundColor, href, ...props }) => {
  const { Link } = useRenderContext()
  return (
    <Link href={href} passHref>
      <a
        {...attributes}
        {...props}
        {...plainLinkRule}
        href={href}
        style={{
          ...attributes?.style,
          display: 'block',
          color,
          backgroundColor,
        }}
      >
        {children}
      </a>
    </Link>
  )
}
