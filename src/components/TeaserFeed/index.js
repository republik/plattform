import React from 'react'
import Container from './Container'
import * as Headlines from './Headline'
import Lead from './Lead'
import Credit from './Credit'
import { css } from 'glamor'
import { renderMdast } from 'mdast-react-render'
import { timeFormat } from '../../lib/timeFormat'
import { Editorial } from '../Typography'

import { matchType } from 'mdast-react-render/lib/utils'

const dateFormat = timeFormat('%d. %B %Y')

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

const DefaultLink = ({ children, path, slug }) => children

export const TeaserFeed = ({
  kind,
  format,
  path,
  slug,
  title,
  description,
  credits,
  publishDate,
  Link = DefaultLink
}) => {
  const Headline =
    kind && kind.indexOf('meta') !== -1
      ? Headlines.Interaction
      : Headlines.Editorial

  return (
    <Container kind={kind} format={format}>
      <Headline>
        <Link slug={slug} path={path}>
          <a {...styles.link}>{title}</a>
        </Link>
      </Headline>
      <Lead>
        <Link slug={slug} path={path}>
          <a {...styles.link}>{description}</a>
        </Link>
      </Lead>

      <Credit>
        {!!credits.length > 0 ? (
          renderMdast(credits, creditSchema)
        ) : (
          dateFormat(Date.parse(publishDate))
        )}
      </Credit>
    </Container>
  )
}
