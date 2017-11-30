import React from 'react'
import Container from './Container'
import * as Headlines from './Headline'
import Lead from './Lead'
import Credit from './Credit'
import { css } from 'glamor'
import { renderMdast } from 'mdast-react-render'
import { Editorial } from '../Typography'

import {
  matchType,
  matchParagraph
} from 'mdast-react-render/lib/utils'

const styles = {
  link: css({
    color: 'inherit',
    textDecoration: 'none'
  })
}

const br = {
  matchMdast: matchType('break'),
  component: () => <br />,
  isVoid: true
}
const link = {
  matchMdast: matchType('link'),
  props: node => ({
    title: node.title,
    href: node.url
  }),
  component: Editorial.A
}
const creditSchema = {
  rules: [link, br]
}

const DefaultLink = ({ children, slug }) => children

export const TeaserFeed = ({ kind, format, slug, title, description, credits, Link = DefaultLink }) => {
  const Headline = kind && kind.indexOf('meta') !== -1
    ? Headlines.Interaction
    : Headlines.Editorial

  return (
    <Container kind={kind} format={format}>
      <Headline>
        <Link slug={slug}>
          <a {...styles.link}>{title}</a>
        </Link>
      </Headline>
      <Lead>
        <Link slug={slug}>
          <a {...styles.link}>{description}</a>
        </Link>
      </Lead>
      {!!credits && <Credit>{renderMdast(credits, creditSchema)}</Credit>}
    </Container>
  )
}

