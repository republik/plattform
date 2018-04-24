import React from 'react'
import { css } from 'glamor'

import createCommentSchema from '../schema'

import { BlockQuote, BlockQuoteParagraph } from '../../../components/BlockQuote'
import { HR } from '../../../components/Typography'
import * as Editorial from '../../../components/Typography/Editorial'
import * as Interaction from '../../../components/Typography/Interaction'
import { List, ListItem } from '../../../components/List'

const styles = {
  p: css({
    margin: '10px 0',
    ':first-child': {
      marginTop: 0
    },
    ':last-child': {
      marginBottom: 0
    }
  }),
  code: css({
    backgroundColor: '#f7f7f7',
    borderRadius: '2px',
    display: 'inline-block',
    fontSize: '90%',
    padding: '0 5px'
  })
}

const P = ({ children }) => (
  <p {...styles.p}>{children}</p>
)

const CommentListItem = ({ children }) => (
  <ListItem style={{
    fontSize: 'inherit',
    lineHeight: 'inherit'
  }}>
    {children}
  </ListItem>
)

const CommentBlockQuote = ({ children }) => (
  <BlockQuote style={{margin: '20px auto'}}>
    <BlockQuoteParagraph style={{
      fontFamily: 'inherit',
      fontSize: 'inherit',
      lineHeight: 'inherit'
    }}>
      {children}
    </BlockQuoteParagraph>
  </BlockQuote>
)

const Heading = ({ children }) => (
  <P><Editorial.Emphasis>{children}</Editorial.Emphasis></P>
)

const Code = ({ children }) => (
  <code {...styles.code}>{children}</code>
)

const createSchema = ({ ...args } = {}) => {
  return createCommentSchema({
    Code,
    Cursive: Editorial.Cursive,
    Emphasis: Editorial.Emphasis,
    StrikeThrough: Editorial.StrikeThrough,
    Link: Editorial.A,
    List,
    ListItem: CommentListItem,
    P,
    BlockQuote: CommentBlockQuote,
    Heading,
    HR,
    ...args
  })
}

export default createSchema
