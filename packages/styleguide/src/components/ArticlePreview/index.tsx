import React from 'react'
import { css } from 'glamor'
import {
  serifRegular23,
  serifTitle38,
  serifRegular16,
  serifTitle28,
} from '../Typography/styles'
import { useRenderContext } from '../Editor/Render/Context'
import { plainLinkRule } from '../Typography'
import { mUp } from '../../theme/mediaQueries'

const styles = {
  title: css({
    margin: '0px 0px 12px 0px',
    ...serifTitle28,
    [mUp]: {
      margin: '0px 0px 17px 0px',
      ...serifTitle38,
    },
  }),
  lead: css({
    margin: 0,
    ...serifRegular16,
    [mUp]: {
      ...serifRegular23,
    },
  }),
  container: css({
    textAlign: 'center',
    padding: 15,
    [mUp]: {
      padding: 20,
    },
  }),
}

export const ArticleTextContainer: React.FC<{
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, ...props }) => {
  return (
    <div {...attributes} {...props} {...styles.container}>
      {children}
    </div>
  )
}

export const ArticleTitle: React.FC<{
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, color, backgroundColor, ...props }) => {
  return (
    <h4 {...attributes} {...props} {...styles.title}>
      {children}
    </h4>
  )
}

export const ArticleLead: React.FC<{
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, color, backgroundColor, ...props }) => {
  return (
    <p {...attributes} {...props} {...styles.lead}>
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
