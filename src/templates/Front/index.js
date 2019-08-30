import React from 'react'

import {
  matchType,
  matchZone,
  matchParagraph,
  matchHeading,
  matchImageParagraph
} from 'mdast-react-render/lib/utils'

import colors from '../../theme/colors'

import {
  TeaserFrontImage,
  TeaserFrontImageHeadline,
  TeaserFrontTypo,
  TeaserFrontTypoHeadline,
  TeaserFrontSplit,
  TeaserFrontSplitHeadline,
  TeaserFrontTile,
  TeaserFrontTileHeadline,
  TeaserFrontTileRow,
  TeaserFrontFormat,
  TeaserFrontLead,
  TeaserFrontCredit,
  TeaserFrontCreditLink,
  TeaserFrontSubject
} from '../../components/TeaserFront'

import {
  TeaserFrontDossier,
  TeaserFrontDossierIntro,
  TeaserFrontDossierHeadline,
  TeaserFrontDossierLead,
  TeaserFrontDossierMore,
  DossierTag,
  DossierTileHeadline
} from '../../components/Dossier'

import {
  TeaserCarousel,
  TeaserCarouselRow,
  TeaserCarouselTile,
  TeaserCarouselFormat,
  TeaserCarouselHeadline,
  TeaserCarouselSubject,
  TeaserCarouselLead
} from '../../components/TeaserCarousel'

import {
  TeaserSectionTitle
} from '../../components/TeaserShared'

import {
  matchTeaser,
  matchTeaserGroup,
  matchTeaserType,
  skipMdastImage,
  extractImage,
  globalInlines,
  styles
} from '../Article/utils'


export const subject = {
  matchMdast: matchHeading(2),
  component: ({ children, attributes, ...props }) =>
    <TeaserFrontSubject attributes={attributes} {...props}>
      {children}
    </TeaserFrontSubject>,
  props: (node, index, parent, { ancestors }) => {
    const teaserGroup = ancestors.find(matchTeaserGroup)
    const teaser = ancestors.find(matchTeaser)
    return {
      color: teaser && teaser.data.color,
      collapsedColor: teaser && teaser.data.feuilleton && '#000',
      columns:  teaserGroup ? teaserGroup.data.columns : undefined
    }
  },
  editorModule: 'headline',
  editorOptions: {
    type: 'FRONTSUBJECT',
    placeholder: 'Subject',
    depth: 2,
    isStatic: true
  },
  rules: globalInlines
}

const DefaultLink = ({ children }) => children

const createSchema = ({
  Link = DefaultLink
} = {}) => {
  const credit = {
    matchMdast: matchParagraph,
    component: ({ children, attributes }) =>
      <TeaserFrontCredit attributes={attributes}>{children}</TeaserFrontCredit>,
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
            color: teaser
              ? teaser.data.color
              : colors.primary,
            collapsedColor: teaser && teaser.data.feuilleton
              ? '#000'
              : undefined
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

  const title = (type, Headline) => ({
    matchMdast: matchHeading(1),
    component: ({ children, href, ...props }) =>
      <Link href={href} passHref>
        <a {...styles.link} href={href}>
          <Headline {...props}>{children}</Headline>
        </a>
      </Link>,
    props (node, index, parent, { ancestors }) {
      const teaser = ancestors.find(matchTeaser)
      const teaserGroup = ancestors.find(matchTeaserGroup)
      return {
        kind: parent.data.kind,
        titleSize: parent.data.titleSize,
        href: teaser
          ? teaser.data.url
          : undefined,
        columns: teaserGroup
          ? teaserGroup.data.columns
          : undefined
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

  const lead = {
    matchMdast: matchHeading(4),
    component: ({ children, attributes, ...props }) =>
      <TeaserFrontLead attributes={attributes} {...props}>
        {children}
      </TeaserFrontLead>,
    props: (node, index, parent, { ancestors }) => {
      const teaserGroup = ancestors.find(matchTeaserGroup)
      return {
        columns:  teaserGroup ? teaserGroup.data.columns : undefined
      }
    },
    editorModule: 'headline',
    editorOptions: {
      type: 'FRONTLEAD',
      placeholder: 'Lead',
      depth: 4,
      isStatic: true
    },
    rules: globalInlines
  }

  const format = {
    matchMdast: matchHeading(6),
    component: ({ children, attributes, href, color, collapsedColor }) =>
      <TeaserFrontFormat color={color} collapsedColor={collapsedColor}>
        <Link href={href} passHref>
          <a href={href} {...styles.link}>
            {children}
          </a>
        </Link>
      </TeaserFrontFormat>,
    props (node, index, parent, { ancestors }) {
      const teaser = ancestors.find(matchTeaser)
      return {
        href: teaser
          ? teaser.data.formatUrl
          : undefined,
        color: teaser && teaser.data.feuilleton ? (teaser.data.color || colors.feuilleton) : undefined,
        collapsedColor: teaser && teaser.data.feuilleton && teaser.data.teaserType === 'frontImage'
          ? '#000'
          : undefined
      }
    },
    editorModule: 'headline',
    editorOptions: {
      type: 'FRONTFORMAT',
      placeholder: 'Format',
      depth: 6,
      isStatic: true
    },
    rules: globalInlines
  }

  const frontImageTeaser = {
    matchMdast: matchTeaserType('frontImage'),
    props: (node, i) => ({
      image: extractImage(node.children[0]),
      aboveTheFold: i < 2,
      ...node.data
    }),
    component: ({ children, attributes, ...props }) => (
      <Link href={props.url}>
        <TeaserFrontImage attributes={attributes} {...props}>
          {children}
        </TeaserFrontImage>
      </Link>
    ),
    editorModule: 'teaser',
    editorOptions: {
      type: 'FRONTIMAGE',
      teaserType: 'frontImage',
      insertButtonText: 'Front Image',
      formOptions: [
        'formatUrl',
        'textPosition',
        'color',
        'bgColor',
        'center',
        'kind',
        'titleSize',
        'image',
        'byline',
        'onlyImage',
        'feuilleton'
      ]
    },
    rules: [
      skipMdastImage,
      title(
        'FRONTIMAGETITLE',
        ({ children, attributes, kind, titleSize }) => {
          const Component = kind === 'editorial'
            ? TeaserFrontImageHeadline.Editorial
            : TeaserFrontImageHeadline.Interaction
          const sizes = {
            medium: titleSize === 'medium',
            large: titleSize === 'large',
            small: titleSize === 'small'
          }
          return <Component attributes={attributes} {...sizes}>
            {children}
          </Component>
        }
      ),
      subject,
      lead,
      format,
      credit
    ]
  }

  const frontSplitTeaser = {
    matchMdast: matchTeaserType('frontSplit'),
    component: ({ children, attributes, ...props }) => (
      <Link href={props.url}>
        <TeaserFrontSplit attributes={attributes} {...props}>
          {children}
        </TeaserFrontSplit>
      </Link>
    ),
    props: (node, i) => ({
      image: extractImage(node.children[0]),
      aboveTheFold: i < 2,
      ...node.data
    }),
    editorModule: 'teaser',
    editorOptions: {
      type: 'FRONTSPLIT',
      teaserType: 'frontSplit',
      insertButtonText: 'Front Split',
      formOptions: [
        'formatUrl',
        'color',
        'bgColor',
        'center',
        'image',
        'byline',
        'kind',
        'titleSize',
        'reverse',
        'portrait',
        'feuilleton'
      ]
    },
    rules: [
      skipMdastImage,
      title(
        'FRONTSPLITTITLE',
        ({ children, attributes, kind, titleSize }) => {
          const Component = kind === 'editorial'
            ? TeaserFrontSplitHeadline.Editorial
            : TeaserFrontSplitHeadline.Interaction
          const sizes = {
            medium: titleSize === 'medium',
            large: titleSize === 'large'
          }
          return <Component attributes={attributes} {...sizes}>
            {children}
          </Component>
        }
      ),
      subject,
      lead,
      format,
      credit
    ]
  }

  const frontTypoTeaser = {
    matchMdast: matchTeaserType('frontTypo'),
    component: ({ children, attributes, ...props }) => (
      <Link href={props.url}>
        <TeaserFrontTypo attributes={attributes} {...props}>
          {children}
        </TeaserFrontTypo>
      </Link>
    ),
    props (node) {
      return node.data
    },
    editorModule: 'teaser',
    editorOptions: {
      type: 'FRONTTYPO',
      teaserType: 'frontTypo',
      insertButtonText: 'Front Typo',
      formOptions: [
        'formatUrl',
        'color',
        'bgColor',
        'kind',
        'titleSize',
        'feuilleton'
      ]
    },
    rules: [
      skipMdastImage,
      title(
        'FRONTTYPOTITLE',
        ({ children, attributes, kind, titleSize }) => {
          const Component = kind === 'editorial'
          ? TeaserFrontTypoHeadline.Editorial
          : TeaserFrontTypoHeadline.Interaction
          const sizes = {
            medium: titleSize === 'medium',
            large: titleSize === 'large',
            small: titleSize === 'small'
          }
          return <Component attributes={attributes} {...sizes}>
            {children}
          </Component>
        }
      ),
      subject,
      lead,
      format,
      credit
    ]
  }

  const frontTileTeaser = {
    matchMdast: matchTeaserType('frontTile'),
    component: ({ children, attributes, ...props }) => (
      <Link href={props.url}>
        <TeaserFrontTile attributes={attributes} {...props}>
          {children}
        </TeaserFrontTile>
      </Link>
    ),
    props: (node, index, parent, {ancestors}) => {
      const aboveTheFold = ancestors[1].children.indexOf(ancestors[0]) < 2
      return {
        image: extractImage(node.children[0]),
        aboveTheFold,
        ...node.data
      }
    },
    editorModule: 'teaser',
    editorOptions: {
      type: 'FRONTTILE',
      teaserType: 'frontTile',
      showUI: false,
      formOptions: [
        'formatUrl',
        'color',
        'bgColor',
        'center',
        'titleSize',
        'showImage',
        'onlyImage',
        'image',
        'byline',
        'kind',
        'feuilleton'
      ]
    },
    rules: [
      skipMdastImage,
      title(
        'FRONTTILETITLE',
        ({ children, attributes, kind, titleSize, columns }) => {
          const Component = kind === 'editorial'
          ? TeaserFrontTileHeadline.Editorial
          : kind === 'scribble'
            ? TeaserFrontTileHeadline.Scribble
            : TeaserFrontTileHeadline.Interaction
          const sizes = {
            medium: titleSize === 'medium'
          }
          return (
            <Component attributes={attributes} columns={columns} {...sizes}>
              {children}
            </Component>
          )
        }
      ),
      subject,
      lead,
      format,
      credit
    ]
  }

  
  const carouselSubject = {
    matchMdast: matchHeading(2),
    component: ({ children, attributes, ...props }) =>
      <TeaserCarouselSubject attributes={attributes} {...props}>
        {children}
      </TeaserCarouselSubject>,
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
    component: ({ children, attributes }) =>
      <TeaserCarouselLead attributes={attributes}>
        {children}
      </TeaserCarouselLead>,
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
    component: ({ children, attributes, href, formatColor }) =>
      <TeaserCarouselFormat color={formatColor}>
        <Link href={href} passHref>
          <a href={href} {...styles.link}>
            {children}
          </a>
        </Link>
      </TeaserCarouselFormat>,
    props (node, index, parent, { ancestors }) {
      const teaser = ancestors.find(matchTeaser)
      return {
        href: teaser
          ? teaser.data.formatUrl
          : undefined,
        formatColor: teaser 
          ? teaser.data.formatColor
          : undefined
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
      title(
        'CAROUSELTILETITLE',
        ({ children, attributes, kind }) => {
          const Component = kind === 'editorial'
          ? TeaserCarouselHeadline.Editorial
          : kind === 'scribble'
            ? TeaserCarouselHeadline.Scribble
            : TeaserCarouselHeadline.Interaction
          return (
            <Component attributes={attributes}>
              {children}
            </Component>
          )
        }
      ),
      carouselSubject,
      carouselTileLead,
      carouselFormat,
      credit
    ]
  }

  const carouselRow = {
    matchMdast: matchZone('TEASERGROUP'),
    component: ({ children, attributes, ...props }) => {
      return <TeaserCarouselRow attributes={attributes} {...props}>
        {children}
      </TeaserCarouselRow>
    },
    editorModule: 'articleGroup',
    editorOptions: {
      type: 'CAROUSELROW'
    },
    rules: [
      carouselTile
    ]
  }

  const carousel = {
    matchMdast: matchTeaserType('carousel'),
    component: ({ children, attributes, ...props }) => {
      return <TeaserCarousel attributes={attributes} {...props}>
        {children}
      </TeaserCarousel>
    },
    props: node => ({
      ...node.data
    }),
    editorModule: 'carousel',
    editorOptions: {
      type: 'CAROUSEL',
      teaserType: 'carousel',
      insertButtonText: 'Carousel',
      formTitle: 'Carousel',
      formOptions: [
        'noAdapt',
        'color',
        'bgColor',
        'outline',
        'bigger'
      ],
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

  const schema = {
    getPath: ({ slug }) => `/${(slug || '').split('/').pop()}`,
    rules: [
      {
        matchMdast: matchType('root'),
        // the document is not a node in slate and doesn't need attributes
        component: ({ children }) => children,
        editorModule: 'front',
        rules: [
          {
            matchMdast: () => false,
            editorModule: 'meta'
          },
          frontImageTeaser,
          frontTypoTeaser,
          frontSplitTeaser,
          {
            matchMdast: node => {
              return matchZone('TEASERGROUP')(node)
            },
            props: node => ({
              columns: node.data.columns,
              mobileColumns: node.data.mobileColumns
            }),
            component: ({ children, attributes, ...props }) => {
              return <TeaserFrontTileRow attributes={attributes} {...props}>
                {children}
              </TeaserFrontTileRow>
            },
            editorModule: 'teasergroup',
            editorOptions: {
              type: 'FRONTTILEROW',
              insertButton: 'Front Tile Row'
            },
            rules: [
              frontTileTeaser
            ]
          },
          carousel,
          {
            matchMdast: () => false,
            editorModule: 'specialchars'
          }
        ]
      }
    ]
  }

  return schema
}

export default createSchema
