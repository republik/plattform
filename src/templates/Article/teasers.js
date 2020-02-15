import React from 'react'

import * as Interaction from '../../components/Typography/Interaction'
import colors from '../../theme/colors'

import {
  matchType,
  matchZone,
  matchParagraph,
  matchHeading
} from 'mdast-react-render/lib/utils'

import {
  matchTeaser,
  matchTeaserType,
  matchTeaserGroup,
  extractImage,
  globalInlines,
  skipMdastImage,
  styles
} from './utils'

import {
  TeaserFrontCredit,
  TeaserFrontCreditLink,
  TeaserFrontLead,
  TeaserFrontTile,
  TeaserFrontTileRow
} from '../../components/TeaserFront'

import {
  TeaserCarousel,
  TeaserCarouselRow,
  TeaserCarouselTile,
  TeaserCarouselFormat,
  TeaserCarouselHeadline,
  TeaserCarouselSubject,
  TeaserCarouselLead
} from '../../components/TeaserCarousel'

import { TeaserSectionTitle } from '../../components/TeaserShared'

import { DossierSubheader, DossierTileHeadline } from '../../components/Dossier'

import { subject } from '../Front'

import { Breakout } from '../../components/Center'
import RawHtml from '../../components/RawHtml'

import * as Editorial from '../../components/Typography/Editorial'

const articleTileSubject = {
  ...subject,
  props: (node, index, parent, { ancestors }) => {
    const teaser = ancestors.find(matchTeaser)
    return {
      color: teaser && teaser.data.color ? teaser.data.color : '#000',
      columns: 3
    }
  }
}

const createTeasers = ({ t, Link, plattformUnauthorizedZoneText }) => {
  const teaserTitle = (type, Headline) => ({
    matchMdast: matchHeading(1),
    component: ({ children, href, ...props }) => (
      <Link href={href} passHref>
        <a {...styles.link} href={href}>
          <Headline {...props}>{children}</Headline>
        </a>
      </Link>
    ),
    props(node, index, parent, { ancestors }) {
      const teaser = ancestors.find(matchTeaser)
      return {
        kind:
          parent.data.kind === 'feuilleton' ? 'editorial' : parent.data.kind,
        titleSize: parent.data.titleSize,
        href: teaser ? teaser.data.url : undefined
      }
    },
    editorModule: 'headline',
    editorOptions: {
      type,
      placeholder: 'Titel',
      isStatic: true,
      depth: 1
    },
    rules: globalInlines
  })

  const articleTileLead = {
    matchMdast: matchHeading(4),
    component: ({ children, attributes, ...props }) => (
      <TeaserFrontLead attributes={attributes} columns={3}>
        {children}
      </TeaserFrontLead>
    ),
    editorModule: 'headline',
    editorOptions: {
      type: 'ARTICLETILELEAD',
      placeholder: 'Lead',
      isStatic: true,
      depth: 4,
      optional: true
    },
    rules: globalInlines
  }

  const teaserFormat = {
    matchMdast: matchHeading(6),
    component: ({ children, attributes, formatColor, href, hasChildren }) => {
      if (!hasChildren) {
        return null
      }
      return (
        <Editorial.Format attributes={attributes} color={formatColor}>
          <Link href={href} passHref>
            <a href={href} {...styles.link}>
              {children}
            </a>
          </Link>
        </Editorial.Format>
      )
    },
    props(node, index, parent, { ancestors }) {
      const teaser = ancestors.find(matchTeaser)
      const data = teaser && teaser.data
      return {
        hasChildren: node.children.length,
        formatColor: data
          ? data.formatColor
            ? data.formatColor
            : data.kind
            ? colors[data.kind]
            : undefined
          : undefined,
        href: data ? data.formatUrl : undefined
      }
    },
    editorModule: 'headline',
    editorOptions: {
      type: 'FRONTFORMAT',
      placeholder: 'Format',
      isStatic: true,
      depth: 6,
      optional: true
    },
    rules: globalInlines
  }

  const teaserCredit = {
    matchMdast: matchParagraph,
    component: ({ children, attributes }) => (
      <TeaserFrontCredit attributes={attributes}>{children}</TeaserFrontCredit>
    ),
    editorModule: 'paragraph',
    editorOptions: {
      type: 'FRONTCREDIT',
      placeholder: 'Credit',
      isStatic: true
    },
    rules: [
      ...globalInlines,
      {
        matchMdast: matchType('link'),
        props: node => {
          return {
            title: node.title,
            href: node.url
          }
        },
        component: ({ children, data, ...props }) => (
          <Link href={props.href} passHref>
            <TeaserFrontCreditLink {...props}>{children}</TeaserFrontCreditLink>
          </Link>
        ),
        editorModule: 'link',
        editorOptions: {
          type: 'FRONTLINK',
          formatTypes: ['FRONTCREDIT']
        }
      }
    ]
  }

  const getSingleColumn = ancestors => {
    const collection = ancestors.find(matchZone('ARTICLECOLLECTION'))
    return collection && collection.data.singleColumn
  }

  const articleTile = {
    matchMdast: matchTeaserType('articleTile'),
    component: ({ children, attributes, singleColumn, ...props }) => (
      <Link href={props.url}>
        <TeaserFrontTile
          singleColumn={singleColumn}
          attributes={attributes}
          {...props}
        >
          {children}
        </TeaserFrontTile>
      </Link>
    ),
    props: (node, index, parent, { ancestors }) => ({
      singleColumn: getSingleColumn(ancestors),
      image: extractImage(node.children[0]),
      ...node.data
    }),
    editorModule: 'teaser',
    editorOptions: {
      type: 'ARTICLETILE',
      teaserType: 'articleTile',
      showUI: false,
      formOptions: ['formatUrl', 'formatColor', 'showImage', 'image', 'kind']
    },
    rules: [
      skipMdastImage,
      teaserTitle('ARTICLETILETITLE', ({ children, attributes, kind }) => {
        const Component =
          kind === 'editorial'
            ? DossierTileHeadline.Editorial
            : kind === 'scribble'
            ? DossierTileHeadline.Scribble
            : DossierTileHeadline.Interaction
        return <Component attributes={attributes}>{children}</Component>
      }),
      articleTileSubject,
      articleTileLead,
      teaserFormat,
      teaserCredit
    ]
  }

  const articleTileRow = {
    matchMdast: node => {
      return matchZone('TEASERGROUP')(node)
    },
    component: ({ children, attributes, singleColumn, ...props }) => {
      return (
        <TeaserFrontTileRow
          autoColumns={!singleColumn}
          singleColumn={singleColumn}
          attributes={attributes}
          {...props}
        >
          {children}
        </TeaserFrontTileRow>
      )
    },
    props: (node, index, parent, { ancestors }) => ({
      singleColumn: getSingleColumn(ancestors)
    }),
    editorModule: 'articleGroup',
    editorOptions: {
      type: 'ARTICLETILEROW'
    },
    rules: [articleTile]
  }

  const credit = {
    matchMdast: matchParagraph,
    component: ({ children, attributes }) => (
      <TeaserFrontCredit attributes={attributes}>{children}</TeaserFrontCredit>
    ),
    editorModule: 'paragraph',
    editorOptions: {
      type: 'FRONTCREDIT',
      placeholder: 'Credit',
      isStatic: true
    },
    rules: [
      ...globalInlines,
      {
        matchMdast: matchType('link'),
        props: (node, index, parent, { ancestors }) => {
          const teaser = ancestors.find(matchTeaser)
          return {
            title: node.title,
            href: node.url,
            color: teaser ? teaser.data.color : colors.primary,
            collapsedColor:
              teaser && teaser.data.feuilleton ? '#000' : undefined
          }
        },
        component: ({ children, data, ...props }) => (
          <Link href={props.href} passHref>
            <TeaserFrontCreditLink {...props}>{children}</TeaserFrontCreditLink>
          </Link>
        ),
        editorModule: 'link',
        editorOptions: {
          type: 'FRONTLINK'
        }
      }
    ]
  }
  const title = (type, Headline) => ({
    matchMdast: matchHeading(1),
    component: ({ children, href, ...props }) => (
      <Link href={href} passHref>
        <a {...styles.link} href={href}>
          <Headline {...props}>{children}</Headline>
        </a>
      </Link>
    ),
    props(node, index, parent, { ancestors }) {
      const teaser = ancestors.find(matchTeaser)
      const teaserGroup = ancestors.find(matchTeaserGroup)
      return {
        kind: parent.data.kind,
        titleSize: parent.data.titleSize,
        href: teaser ? teaser.data.url : undefined,
        columns: teaserGroup ? teaserGroup.data.columns : undefined
      }
    },
    editorModule: 'headline',
    editorOptions: {
      type,
      placeholder: 'Titel',
      depth: 1,
      isStatic: true
    },
    rules: globalInlines
  })

  const carouselSubject = {
    matchMdast: matchHeading(2),
    component: ({ children, attributes, ...props }) => (
      <TeaserCarouselSubject attributes={attributes} {...props}>
        {children}
      </TeaserCarouselSubject>
    ),
    props: (node, index, parent, { ancestors }) => {
      const teaser = ancestors.find(matchTeaser)
      return {
        color: teaser && teaser.data.color
      }
    },
    editorModule: 'headline',
    editorOptions: {
      type: 'CAROUSELSUBJECT',
      placeholder: 'Subject',
      depth: 2,
      isStatic: true
    },
    rules: globalInlines
  }
  const carouselTileLead = {
    matchMdast: matchHeading(4),
    component: ({ children, attributes }) => (
      <TeaserCarouselLead attributes={attributes}>
        {children}
      </TeaserCarouselLead>
    ),
    editorModule: 'headline',
    editorOptions: {
      type: 'CAROUSELLEAD',
      placeholder: 'Lead',
      isStatic: true,
      depth: 4,
      optional: true
    },
    rules: globalInlines
  }

  const carouselFormat = {
    matchMdast: matchHeading(6),
    component: ({ children, attributes, href, formatColor }) => (
      <TeaserCarouselFormat color={formatColor}>
        <Link href={href} passHref>
          <a href={href} {...styles.link}>
            {children}
          </a>
        </Link>
      </TeaserCarouselFormat>
    ),
    props(node, index, parent, { ancestors }) {
      const teaser = ancestors.find(matchTeaser)
      return {
        href: teaser ? teaser.data.formatUrl : undefined,
        formatColor: teaser ? teaser.data.formatColor : undefined
      }
    },
    editorModule: 'headline',
    editorOptions: {
      type: 'FRONTCAROUSEFORMAT',
      placeholder: 'Format',
      depth: 6,
      isStatic: true
    },
    rules: globalInlines
  }
  const carouselTile = {
    matchMdast: matchTeaserType('articleTile'),
    component: ({ children, attributes, ...props }) => {
      return (
        <Link href={props.url}>
          <TeaserCarouselTile attributes={attributes} {...props}>
            {children}
          </TeaserCarouselTile>
        </Link>
      )
    },
    props: node => ({
      image: extractImage(node.children[0]),
      ...node.data
    }),
    editorModule: 'teaser',
    editorOptions: {
      type: 'CAROUSELTILE',
      showUI: false,
      teaserType: 'articleTile',
      formOptions: [
        'formatUrl',
        'image',
        'byline',
        'kind',
        'showImage',
        'color',
        'bgColor',
        'outline',
        'formatColor',
        'count'
      ],
      defaultValues: {
        // default to context provided values
        color: undefined,
        bgColor: undefined
      }
    },
    rules: [
      skipMdastImage,
      title('CAROUSELTILETITLE', ({ children, attributes, kind }) => {
        const Component =
          kind === 'editorial'
            ? TeaserCarouselHeadline.Editorial
            : kind === 'scribble'
            ? TeaserCarouselHeadline.Scribble
            : TeaserCarouselHeadline.Interaction
        return <Component attributes={attributes}>{children}</Component>
      }),
      carouselSubject,
      carouselTileLead,
      carouselFormat,
      credit
    ]
  }

  const carouselRow = {
    matchMdast: matchZone('TEASERGROUP'),
    component: ({ children, attributes, ...props }) => {
      return (
        <TeaserCarouselRow attributes={attributes} {...props}>
          {children}
        </TeaserCarouselRow>
      )
    },
    editorModule: 'articleGroup',
    editorOptions: {
      type: 'CAROUSELROW'
    },
    rules: [carouselTile]
  }

  const carousel = {
    matchMdast: matchTeaserType('carousel'),
    component: ({ children, attributes, ...props }) => {
      return (
        <TeaserCarousel attributes={attributes} article {...props}>
          {children}
        </TeaserCarousel>
      )
    },
    props: node => ({
      ...node.data
    }),
    editorModule: 'carousel',
    editorOptions: {
      type: 'CAROUSEL',
      teaserType: 'carousel',
      insertButtonText: 'Karussell',
      formTitle: 'Carousel',
      formOptions: ['noAdapt', 'color', 'bgColor', 'outline', 'bigger'],
      defaultValues: {
        outline: '#D7D7D7'
      }
    },
    rules: [
      {
        matchMdast: matchHeading(2),
        component: ({ children, attributes }) => (
          <TeaserSectionTitle attributes={attributes}>
            {children}
          </TeaserSectionTitle>
        ),
        editorModule: 'headline',
        editorOptions: {
          type: 'CAROUSELTITLE',
          placeholder: 'Titel',
          isStatic: true,
          depth: 2
        }
      },
      carouselRow
    ]
  }

  return {
    carousel,
    articleCollection: {
      matchMdast: matchZone('ARTICLECOLLECTION'),
      component: ({
        children,
        attributes,
        unauthorized,
        unauthorizedText,
        singleColumn
      }) => {
        if (unauthorized) {
          if (unauthorizedText) {
            const text = plattformUnauthorizedZoneText || unauthorizedText
            return (
              <div
                style={{
                  backgroundColor: colors.primaryBg,
                  padding: '10px 20px'
                }}
              >
                <RawHtml
                  type={Interaction.P}
                  dangerouslySetInnerHTML={{ __html: text }}
                />
              </div>
            )
          }
          return null
        }
        return (
          <Breakout
            size={singleColumn ? 'normal' : 'breakout'}
            attributes={attributes}
          >
            {children}
          </Breakout>
        )
      },
      props: node => ({
        unauthorized: node.data.membersOnly && !node.children.length,
        unauthorizedText: node.data.unauthorizedText,
        singleColumn: node.data.singleColumn
      }),
      editorModule: 'articleCollection',
      editorOptions: {
        type: 'ARTICLECOLLECTION',
        insertButtonText: 'Artikelsammlung',
        insertTypes: ['PARAGRAPH'],
        formOptions: []
      },
      rules: [
        {
          matchMdast: matchHeading(2),
          component: ({ children, attributes, singleColumn }) => (
            <DossierSubheader
              singleColumn={singleColumn}
              attributes={attributes}
            >
              {children}
            </DossierSubheader>
          ),
          props: (node, index, parent, { ancestors }) => ({
            singleColumn: getSingleColumn(ancestors)
          }),
          editorModule: 'headline',
          editorOptions: {
            type: 'ARTICLECOLLECTIONSUBHEADER',
            placeholder: 'Artikelsammlung',
            depth: 2,
            isStatic: true
          }
        },
        articleTileRow
      ]
    }
  }
}

export default createTeasers
