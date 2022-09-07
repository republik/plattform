import React from 'react'
import { css } from 'glamor'
import {
  sansSerifMedium16,
  sansSerifMedium20,
  serifRegular23,
  serifTitle38,
} from '../Typography/styles'
import { useRenderContext } from '../Editor/Render/Context'
import { plainLinkRule } from '../Typography'
import { FormatData } from '../Editor/custom-types'
import { convertStyleToRem } from '../Typography/utils'
import { mUp } from '../TeaserFront/mediaQueries'
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
}

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
  format: FormatData
  [x: string]: unknown
}> = ({ children, attributes, format, color, backgroundColor, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <h4 {...attributes} {...props} style={{ margin: 0 }} {...css(serifTitle38)}>
      {!!format && (
        <span
          contentEditable={false}
          {...styles.format}
          {...colorScheme.set('color', format.meta.color || 'text', 'format')}
        >
          {format.meta.title}
        </span>
      )}
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
