import React from 'react'

import * as Interaction from '../../components/Typography/Interaction'
import colors from '../../theme/colors'

import {
  matchType,
  matchZone,
  matchParagraph,
  matchHeading,
} from '@republik/mdast-react-render'

import {
  matchTeaser,
  matchTeaserType,
  matchTeaserGroup,
  extractImages,
  globalInlines,
  skipMdastImage,
  styles,
} from './utils'

import {
  TeaserFrontCredit,
  TeaserFrontLead,
  TeaserFrontTile,
  TeaserFrontTileRow,
} from '../../components/TeaserFront'

import {
  TeaserCarousel,
  TeaserCarouselTileContainer,
  TeaserCarouselTile,
  TeaserCarouselFormat,
  TeaserCarouselHeadline,
  TeaserCarouselSubject,
  TeaserCarouselLead,
} from '../../components/TeaserCarousel'

import { TeaserSectionTitle } from '../../components/TeaserShared'

import { DossierSubheader, DossierTileHeadline } from '../../components/Dossier'

import { subject } from '../Front'

import { Breakout } from '../../components/Center'
import RawHtml from '../../components/RawHtml'
import { SeriesNav } from '../../components/SeriesNav'

import * as Editorial from '../../components/Typography/Editorial'
import { shouldRenderPlayButton } from '../shared/audio'

const articleTileSubject = {
  ...subject,
  props: (node, index, parent, { ancestors }) => {
    const teaser = ancestors.find(matchTeaser)
    return {
      color: teaser && teaser.data.color ? teaser.data.color : '#000',
      columns: 3,
    }
  },
}

const createTeasers = ({
  t,
  Link,
  ActionBar,
  plattformUnauthorizedZoneText,
  AudioPlayButton,
}) => {
  const teaserTitle = (type, Headline) => ({
    matchMdast: matchHeading(1),
    component: ({ children, href, ...props }) => (
      <Link
        href={href}
        {...styles.link}
        {...styles.linkOverlay}
        legacyBehavior={false}
      >
        <Headline {...props}>{children}</Headline>
      </Link>
    ),
    props(node, index, parent, { ancestors }) {
      const teaser = ancestors.find(matchTeaser)
      return {
        kind:
          parent.data.kind === 'feuilleton' ? 'editorial' : parent.data.kind,
        titleSize: parent.data.titleSize,
        href: teaser ? teaser.data.url : undefined,
      }
    },
    editorModule: 'headline',
    editorOptions: {
      type,
      placeholder: 'Titel',
      isStatic: true,
      depth: 1,
    },
    rules: globalInlines,
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
      optional: true,
    },
    rules: globalInlines,
  }

  const teaserFormat = {
    matchMdast: matchHeading(6),
    component: ({ children, attributes, formatColor, href, empty }) => {
      if (empty) {
        return null
      }
      return (
        <Editorial.Format attributes={attributes} color={formatColor}>
          <Link href={href} {...styles.link} legacyBehavior={false}>
            {children}
          </Link>
        </Editorial.Format>
      )
    },
    props(node, index, parent, { ancestors }) {
      const teaser = ancestors.find(matchTeaser)
      const data = teaser && teaser.data
      return {
        empty: !node.children.length,
        formatColor: data
          ? data.formatColor
            ? data.formatColor
            : data.kind
            ? colors[data.kind]
            : undefined
          : undefined,
        href: data ? data.formatUrl : undefined,
      }
    },
    editorModule: 'headline',
    editorOptions: {
      type: 'FRONTFORMAT',
      placeholder: 'Format',
      isStatic: true,
      depth: 6,
      optional: true,
    },
    rules: globalInlines,
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
      isStatic: true,
    },
    rules: [
      ...globalInlines,
      {
        matchMdast: matchType('link'),
        props: (node) => {
          return {
            title: node.title,
            href: node.url,
          }
        },
        component: ({ children, ...props }) => (
          <Link
            {...props}
            legacyBehavior={false}
            style={{ color: 'inherit', textDecoration: 'underline' }}
          >
            {children}
          </Link>
        ),
        editorModule: 'link',
        editorOptions: {
          type: 'FRONTLINK',
          formatTypes: ['FRONTCREDIT'],
        },
      },
    ],
  }

  const getSingleColumn = (ancestors) => {
    const collection = ancestors.find(matchZone('ARTICLECOLLECTION'))
    return collection && collection.data.singleColumn
  }

  const articleTile = {
    matchMdast: matchTeaserType('articleTile'),
    component: ({ children, attributes, singleColumn, ...props }) => (
      <TeaserFrontTile
        singleColumn={singleColumn}
        attributes={attributes}
        {...props}
        // darkmode support in article "read more" teaser
        color={undefined}
        bgColor={undefined}
        audioPlayButton={
          !!AudioPlayButton && shouldRenderPlayButton(props) ? (
            <AudioPlayButton documentId={props?.urlMeta.documentId} />
          ) : undefined
        }
      >
        {children}
      </TeaserFrontTile>
    ),
    props: (node, index, parent, { ancestors }) => ({
      singleColumn: getSingleColumn(ancestors),
      ...extractImages(node.children[0], 'image'),
      ...node.data,
    }),
    editorModule: 'teaser',
    editorOptions: {
      type: 'ARTICLETILE',
      teaserType: 'articleTile',
      showUI: false,
      formOptions: [
        'formatUrl',
        'formatColor',
        'showImage',
        'image',
        'imageDark',
        'kind',
      ],
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
      teaserCredit,
    ],
  }

  const articleTileRow = {
    matchMdast: (node) => {
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
      singleColumn: getSingleColumn(ancestors),
    }),
    editorModule: 'articleGroup',
    editorOptions: {
      type: 'ARTICLETILEROW',
    },
    rules: [articleTile],
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
      isStatic: true,
    },
    rules: [
      ...globalInlines,
      {
        matchMdast: matchType('link'),
        props: (node) => {
          return {
            title: node.title,
            href: node.url,
          }
        },
        component: ({ children, ...props }) => (
          <Link
            {...props}
            legacyBehavior={false}
            style={{ color: 'inherit', textDecoration: 'underline' }}
          >
            {children}
          </Link>
        ),
        editorModule: 'link',
        editorOptions: {
          type: 'FRONTLINK',
        },
      },
    ],
  }
  const title = (type, Headline) => ({
    matchMdast: matchHeading(1),
    component: ({ children, href, ...props }) => (
      <Link
        href={href}
        {...styles.link}
        {...styles.linkOverlay}
        legacyBehavior={false}
      >
        <Headline {...props}>{children}</Headline>
      </Link>
    ),
    props(node, index, parent, { ancestors }) {
      const teaser = ancestors.find(matchTeaser)
      const teaserGroup = ancestors.find(matchTeaserGroup)
      return {
        kind: parent.data.kind,
        titleSize: parent.data.titleSize,
        href: teaser ? teaser.data.url : undefined,
        columns: teaserGroup ? teaserGroup.data.columns : undefined,
      }
    },
    editorModule: 'headline',
    editorOptions: {
      type,
      placeholder: 'Titel',
      depth: 1,
      isStatic: true,
    },
    rules: globalInlines,
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
        color: teaser && teaser.data.color,
      }
    },
    editorModule: 'headline',
    editorOptions: {
      type: 'CAROUSELSUBJECT',
      placeholder: 'Subject',
      depth: 2,
      isStatic: true,
    },
    rules: globalInlines,
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
      optional: true,
    },
    rules: globalInlines,
  }

  const carouselFormat = {
    matchMdast: matchHeading(6),
    component: ({ children, attributes, href, formatColor }) => (
      <TeaserCarouselFormat color={formatColor}>
        <Link href={href} {...styles.link} legacyBehavior={false}>
          {children}
        </Link>
      </TeaserCarouselFormat>
    ),
    props(node, index, parent, { ancestors }) {
      const teaser = ancestors.find(matchTeaser)
      return {
        href: teaser ? teaser.data.formatUrl : undefined,
        formatColor: teaser ? teaser.data.formatColor : undefined,
      }
    },
    editorModule: 'headline',
    editorOptions: {
      type: 'FRONTCAROUSEFORMAT',
      placeholder: 'Format',
      depth: 6,
      isStatic: true,
    },
    rules: globalInlines,
  }
  const carouselTile = {
    matchMdast: matchTeaserType('articleTile'),
    component: ({ children, attributes, ...props }) => {
      return (
        <TeaserCarouselTile
          attributes={attributes}
          audioPlayButton={
            !!AudioPlayButton && shouldRenderPlayButton(props) ? (
              <AudioPlayButton documentId={props?.urlMeta.documentId} />
            ) : undefined
          }
          {...props}
        >
          {children}
        </TeaserCarouselTile>
      )
    },
    props: (node) => ({
      ...extractImages(node.children[0], 'image'),
      ...node.data,
    }),
    editorModule: 'teaser',
    editorOptions: {
      type: 'CAROUSELTILE',
      showUI: false,
      teaserType: 'articleTile',
      formOptions: [
        'formatUrl',
        'image',
        'imageDark',
        'byline',
        'kind',
        'showImage',
        'color',
        'bgColor',
        'outline',
        'formatColor',
        'count',
      ],
      defaultValues: {
        // default to context provided values
        color: undefined,
        bgColor: undefined,
      },
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
      credit,
    ],
  }

  const carouselRow = {
    matchMdast: matchZone('TEASERGROUP'),
    component: ({ children, attributes, ...props }) => {
      return (
        <TeaserCarouselTileContainer attributes={attributes} {...props}>
          {children}
        </TeaserCarouselTileContainer>
      )
    },
    editorModule: 'articleGroup',
    editorOptions: {
      type: 'CAROUSELROW',
    },
    rules: [carouselTile],
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
    props: (node) => ({
      ...node.data,
    }),
    editorModule: 'carousel',
    editorOptions: {
      type: 'CAROUSEL',
      teaserType: 'carousel',
      insertButtonText: 'Karussell',
      formTitle: 'Carousel',
      formOptions: ['noAdapt', 'color', 'bgColor', 'outline', 'bigger', 'grid'],
      defaultValues: {
        outline: true,
      },
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
          depth: 2,
        },
      },
      carouselRow,
    ],
  }

  const seriesNav = {
    matchMdast: matchZone('SERIES_NAV'),
    component: ({ ...props }) => {
      // HOTFIX: prevent Errors when navigation to an article with a seriesNav
      // when series is null.
      if (!props.series) {
        return null
      }

      return <SeriesNav t={t} {...props} />
    },
    props: (node, index, parent, { ancestors }) => {
      const root = ancestors[ancestors.length - 1]
      return {
        repoId: root.repoId,
        series: root.series,
        inline: !node.data.grid,
        ActionBar: ActionBar,
        Link: Link,
      }
    },
    rules: [],
    editorModule: 'seriesNav',
    editorOptions: {
      insertTypes: ['PARAGRAPH'],
    },
    isVoid: true,
  }

  return {
    carousel,
    seriesNav,
    articleCollection: {
      matchMdast: matchZone('ARTICLECOLLECTION'),
      component: ({
        children,
        attributes,
        unauthorized,
        unauthorizedText,
        singleColumn,
      }) => {
        if (unauthorized) {
          if (unauthorizedText) {
            const text = plattformUnauthorizedZoneText || unauthorizedText
            return (
              <div
                style={{
                  backgroundColor: colors.primaryBg,
                  padding: '10px 20px',
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
      props: (node) => ({
        unauthorized: node.data.membersOnly && !node.children.length,
        unauthorizedText: node.data.unauthorizedText,
        singleColumn: node.data.singleColumn,
      }),
      editorModule: 'articleCollection',
      editorOptions: {
        type: 'ARTICLECOLLECTION',
        insertButtonText: 'Artikelsammlung',
        insertTypes: ['PARAGRAPH'],
        formOptions: [],
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
            singleColumn: getSingleColumn(ancestors),
          }),
          editorModule: 'headline',
          editorOptions: {
            type: 'ARTICLECOLLECTIONSUBHEADER',
            placeholder: 'Artikelsammlung',
            depth: 2,
            isStatic: true,
          },
        },
        articleTileRow,
      ],
    },
  }
}

export default createTeasers
