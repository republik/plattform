import React from 'react'
import * as styles from './styles'
import {css} from 'glamor'

const eHeadlineRule = css(styles.editorialHeadline)
const eSubheadRule = css(styles.editorialSubhead)
const eLeadRule = css(styles.editorialLead)
const eCreditRule = css(styles.editorialCredit)
const ePRule = css(styles.editorialP)
const eQuestionRule = css(styles.editorialQuestion)
const eAuthorLinkRule = css(styles.editorialAuthorLink)
const eFormat = css(styles.editorialFormat)


// attributes are piped through for publikator editor support.
const Editorial = {
  Headline: ({ children, attributes, type, ...props }) => (
    <h1 {...attributes} {...props} {...eHeadlineRule}>
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
  AuthorLink: ({ children, attributes, ...props }) => (
    <a {...attributes} {...props} {...eAuthorLinkRule}>
      {children}
    </a>
  ),
  Format: ({ children, attributes, ...props }) => (
    <p {...attributes} {...props} {...eFormat}>
      {children}
    </p>
  ),
}

export default Editorial
