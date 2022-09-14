import React from 'react'
import { css } from 'glamor'
import {
  serifRegular23,
  serifTitle38,
  serifRegular16,
  serifTitle28,
  sansSerifMedium16,
  sansSerifMedium20,
} from '../Typography/styles'
import { useRenderContext } from '../Editor/Render/Context'
import { plainLinkRule } from '../Typography'
import { mUp } from '../../theme/mediaQueries'
import { convertStyleToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/ColorContext'

const styles = {
  format: css({
    display: 'block',
    ...convertStyleToRem(sansSerifMedium16),
    margin: '0 0 18px 0',
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium20),
      margin: '0 0 28px 0',
    },
  }),
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
      padding: 42,
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

export const ArticleFormat: React.FC<{
  attributes: any
  href?: string
  [x: string]: unknown
}> = ({ children, attributes, href, ...props }) => {
  const { Link } = useRenderContext()
  const Tag = href ? 'a' : 'span'
  return (
    <Link href={href} passHref>
      <Tag {...attributes} {...props} {...styles.format}>
        {children}
      </Tag>
    </Link>
  )
}

export const ArticleTitle: React.FC<{
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, ...props }) => {
  return (
    <h4 {...attributes} {...props} {...styles.title}>
      {children}
    </h4>
  )
}

export const ArticleLead: React.FC<{
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, ...props }) => {
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
  const [colorScheme] = useColorContext()
  return (
    <Link href={href} passHref>
      <a
        {...attributes}
        {...props}
        {...plainLinkRule}
        {...(!color && colorScheme.set('color', 'text'))}
        {...(!backgroundColor && colorScheme.set('backgroundColor', 'default'))}
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
