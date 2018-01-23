import React from 'react'

import {
  matchType,
  matchZone,
  matchParagraph,
  matchHeading
} from 'mdast-react-render/lib/utils'

import {
  matchTeaser,
  matchTeaserType,
  extractImage,
  globalInlines,
  skipMdastImage,
  styles
} from './utils'

import {
  TeaserFrontCredit,
  TeaserFrontCreditLink,
  TeaserFrontTile,
  TeaserFrontTileRow,
} from '../../components/TeaserFront'

import {
  DossierSubheader,
  DossierTileHeadline,
  DossierTileLead
} from '../../components/Dossier'

import { Breakout } from '../../components/Center'

import * as Editorial from '../../components/Typography/Editorial'

const createTeasers = ({
  Link
}) => {
  const teaserTitle = (type, Headline) => ({
    matchMdast: matchHeading(1),
    component: ({ children, href, ...props }) =>
      <Link href={href} passHref>
        <a {...styles.link} href={href}>
          <Headline {...props}>{children}</Headline>
        </a>
      </Link>,
    props (node, index, parent, { ancestors }) {
      const teaser = ancestors.find(matchTeaser)
      return {
        kind: parent.data.kind,
        titleSize: parent.data.titleSize,
        href: teaser
          ? teaser.data.url
          : undefined
      }
    },
    editorModule: 'headline',
    editorOptions: {
      type,
      placeholder: 'Titel',
      depth: 1
    },
    rules: globalInlines
  })

  const articleTileLead = {
    matchMdast: matchHeading(4),
    component: ({ children, attributes }) =>
      <DossierTileLead attributes={attributes}>
        {children}
      </DossierTileLead>,
    editorModule: 'headline',
    editorOptions: {
      type: 'ARTICLETILELEAD',
      placeholder: 'Lead',
      depth: 4,
      optional: true
    },
    rules: globalInlines
  }

  const teaserFormat = {
    matchMdast: matchHeading(6),
    component: ({ children, attributes }) =>
      <Editorial.Format attributes={attributes}>
        {children}
      </Editorial.Format>,
    editorModule: 'headline',
    editorOptions: {
      type: 'FRONTFORMAT',
      placeholder: 'Format',
      depth: 6,
      optional: true
    },
    rules: globalInlines
  }

  const teaserCredit = {
    matchMdast: matchParagraph,
    component: ({ children, attributes }) =>
      <TeaserFrontCredit attributes={attributes}>
        {children}
      </TeaserFrontCredit>,
    editorModule: 'paragraph',
    editorOptions: {
      type: 'FRONTCREDIT',
      placeholder: 'Credit'
    },
    rules: [
      ...globalInlines,
      {
        matchMdast: matchType('link'),
        props: (node) => {
          return {
            title: node.title,
            href: node.url
          }
        },
        component: ({ children, data, ...props }) =>
          <Link href={props.href} passHref>
            <TeaserFrontCreditLink {...props}>
              {children}
            </TeaserFrontCreditLink>
          </Link>,
        editorModule: 'link',
        editorOptions: {
          type: 'FRONTLINK'
        }
      }
    ]
  }

  const articleTile = {
    matchMdast: matchTeaserType('articleTile'),
    component: ({ children, attributes, ...props }) => (
      <Link href={props.url}>
        <TeaserFrontTile attributes={attributes} {...props}>
          {children}
        </TeaserFrontTile>
      </Link>
    ),
    props: node => ({
      image: extractImage(node.children[0]),
      ...node.data
    }),
    // TMP: Disabled until editor integration
    // editorModule: 'teaser',
    editorOptions: {
      type: 'ARTICLETILE',
      teaserType: 'articleTile',
      insertButton: 'Artikel Tile',
      dnd: false,
      formOptions: [
        'showImage',
        'image',
        'kind'
      ]
    },
    rules: [
      skipMdastImage,
      teaserTitle(
        'ARTICLETILETITLE',
        ({ children, attributes, kind }) => {
          const Component = kind === 'editorial'
          ? DossierTileHeadline.Editorial
          : DossierTileHeadline.Interaction
          return (
            <Component attributes={attributes}>
              {children}
            </Component>
          )
        }
      ),
      articleTileLead,
      teaserFormat,
      teaserCredit
    ]
  }

  const articleTileRow = {
    matchMdast: node => {
      return matchZone('TEASERGROUP')(node)
    },
    component: ({ children, attributes, ...props }) => {
      return <TeaserFrontTileRow columns={3} attributes={attributes} {...props}>
        {children}
      </TeaserFrontTileRow>
    },
    // TMP: Disabled until editor integration
    // editorModule: 'teasergroup',
    editorOptions: {
      type: 'ARTICLETILEROW',
      dnd: false
    },
    rules: [
      articleTile
    ]
  }

  return {
    articleCollection: {
      matchMdast: matchTeaserType('articleCollection'),
      component: ({ children, attributes, ...props }) => (
        <Breakout size='breakout' attributes={attributes}>
          {children}
        </Breakout>
      ),
      props: node => node.data,
      // TMP: Disabled until editor integration
      // editorModule: 'teaser',
      editorOptions: {
        type: 'ARTICLECOLLECTION',
        teaserType: 'articleCollection',
        insertButton: 'Artikelsammlung',
        formOptions: []
      },
      rules: [
        {
          matchMdast: matchHeading(2),
          component: ({ children, attributes }) => (
            <DossierSubheader attributes={attributes}>
              {children}
            </DossierSubheader>
          ),
          editorModule: 'headline',
          editorOptions: {
            type: 'ARTICLECOLLECTIONSUBHEADER',
            placeholder: 'Artikelsammlung',
            depth: 2
          }
        },
        articleTileRow
      ]
    }
  }
}

export default createTeasers
