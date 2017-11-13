import React from 'react'
import * as styles from './styles'
import {css} from 'glamor'

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

const iH1Rule = css(styles.interactionH1)
const iH2Rule = css(styles.interactionH2)
const iH3Rule = css(styles.interactionH3)
const iPRule = css(styles.interactionP)

export const Interaction = {
  H1: ({children, ...props}) => (
    <h1 {...props} {...iH1Rule}>{children}</h1>
  ),
  H2: ({children, ...props}) => (
    <h2 {...props} {...iH2Rule}>{children}</h2>
  ),
  H3: ({children, ...props}) => (
    <h3 {...props} {...iH3Rule}>{children}</h3>
  ),
  P: ({children, ...props}) => (
    <p {...props} {...iPRule}>{children}</p>
  )
}


const eSubheadRule = css(styles.editorialSubhead)
const eLeadRule = css(styles.editorialLead)
const eCreditRule = css(styles.editorialCredit)
const ePRule = css(styles.editorialP)
const eQuestionRule = css(styles.editorialQuestion)
const eQuoteTextRule = css(styles.editorialQuoteText)
const eCiteRule = css(styles.editorialCite)
const eBoxTitleRule = css(styles.editorialBoxTitle)
const eBoxTextRule = css(styles.editorialBoxText)
const eAuthorLinkRule = css(styles.editorialAuthorLink)
const eMark = css(styles.editorialMark)
const eCaption = css(styles.editorialCaption)
const eByline = css(styles.editorialByline)

const getEditorialHeadlineRule = (type) => {
  switch(type) {
    case 'meta': return css(styles.editorialHeadlineMeta)
    default: return css(styles.editorialHeadline)
  }
}

// attributes are piped through for publikator editor support.
export const Editorial = {
  Headline: ({ children, attributes, type, ...props }) => (
    <h1 {...attributes} {...props} {...getEditorialHeadlineRule(type)}>
      {children}
    </h1>
  ),
  Subhead: ({ children, attributes, ...props }) => (
    <h2 {...attributes} {...props} {...eSubheadRule}>
      {children}
    </h2>
  ),
  Lead: ({ children, attributes, ...props }) => (
    <p {...attributes} {...props} {...eLeadRule}>
      {children}
    </p>
  ),
  Credit: ({ children, attributes, ...props }) => (
    <p {...attributes} {...props} {...eCreditRule}>
      {children}
    </p>
  ),
  P: ({ children, attributes, ...props }) => (
    <p {...attributes} {...props} {...ePRule}>
      {children}
    </p>
  ),
  Answer: ({ children, attributes, ...props }) => (
    <p {...attributes} {...props} {...ePRule}>
      {children}
    </p>
  ),
  AnswerBy: ({ children, attributes, ...props }) => (
    <b {...attributes} {...props}>
      {children}:
    </b>
  ),
  Question: ({ children, attributes, ...props }) => (
    <p {...attributes} {...props} {...eQuestionRule}>
      {children}
    </p>
  ),
  QuoteText: ({ children, attributes, ...props }) => (
    <div {...attributes} {...eQuoteTextRule}>
      {children}
    </div>
  ),
  Cite: ({ children, attributes, ...props }) => (
    <cite {...attributes} {...eCiteRule}>
      {children}
    </cite>
  ),
  BoxTitle: ({ children, attributes, ...props }) => (
    <p {...attributes} {...props} {...eBoxTitleRule}>
      {children}
    </p>
  ),
  BoxText: ({ children, attributes, ...props }) => (
    <p {...attributes} {...props} {...eBoxTextRule}>
      {children}
    </p>
  ),
  AuthorLink: ({ children, attributes, ...props }) => (
    <a {...attributes} {...props} {...eAuthorLinkRule}>
      {children}
    </a>
  ),
  Mark: ({ children, attributes, ...props }) => (
    <p {...attributes} {...props} {...eMark}>
      {children}
    </p>
  ),
  Caption: ({ children, attributes, ...props }) => (
    <figcaption {...attributes} {...props} {...eCaption}>
      {children}
    </figcaption>
  ),
  Byline: ({ children, attributes, ...props }) => (
    <span {...attributes} {...props} {...eByline}>
      {children}
    </span>
  )
}
