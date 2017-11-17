import React from 'react'
import * as styles from './styles'
import * as _Editorial from './Editorial'
import * as _Interaction from './Interaction'
import {css} from 'glamor'

// Namespaced exports.
export const Editorial = {..._Editorial}
export const Interaction = {..._Interaction}

// Direct exports.
export const fontStyles = styles

export const linkRule = css(styles.link)
export const A = ({children, ...props}) => (
  <a {...props} {...linkRule}>{children}</a>
)

const h1Rule = css(styles.h1)
export const H1 = ({children, ...props}) => (
  <h1 {...props} {...h1Rule}>{children}</h1>
)

const h2Rule = css(styles.h2)
export const H2 = ({children, ...props}) => (
  <h2 {...props} {...h2Rule}>{children}</h2>
)

const leadRule = css(styles.lead)
export const Lead = ({children, ...props}) => (
  <p {...props} {...leadRule}>{children}</p>
)

const pRule = css(styles.p)
export const P = ({children, ...props}) => (
  <p {...props} {...pRule}>{children}</p>
)

const labelRule = css(styles.label)
export const Label = ({children, ...props}) => (
  <span {...props} {...labelRule}>{children}</span>
)

const quoteRule = css(styles.quote)
const quoteTextRule = css(styles.quoteText)

export const Quote = ({children, source, ...props}) => (
  <blockquote {...props} {...quoteRule}>
    <div {...quoteTextRule}>«{children}»</div>
    {!!source && <cite>{source}</cite>}
  </blockquote>
)
