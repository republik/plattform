import React from 'react'
import { css } from 'glamor'
import { serifRegular23, serifTitle38 } from '../Typography/styles'
import { ResolvedRepo } from '../Editor/custom-types'
import { getTeaserHref } from '../TeaserFeed'
import { useRenderContext } from '../Editor/Render/Context'

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

// TODO: replace path by most recent path in backend?
export const ArticlePreview: React.FC<{
  attributes: any
  color: string
  backgroundColor: string
  resolvedRepo?: ResolvedRepo
  [x: string]: unknown
}> = ({
  children,
  attributes,
  color,
  backgroundColor,
  resolvedRepo,
  ...props
}) => {
  const { Link } = useRenderContext()
  const href =
    resolvedRepo &&
    getTeaserHref(resolvedRepo.path, resolvedRepo.externalBaseUrl)
  return (
    <Link href={href} passHref>
      <a
        {...attributes}
        {...props}
        style={{
          ...attributes.style,
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
