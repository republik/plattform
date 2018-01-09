import React from 'react'

import {
  matchType,
  matchZone,
  matchParagraph,
  matchHeading,
  matchImageParagraph
} from 'mdast-react-render/lib/utils'

import colors from '../../theme/colors'
import * as Editorial from '../../components/Typography/Editorial'

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
  TeaserFrontLead,
  TeaserFrontCredit,
  TeaserFrontCreditLink
} from '../../components/TeaserFront'

import {
  TeaserFrontDossier,
  TeaserFrontDossierIntro,
  TeaserFrontDossierHeadline,
  TeaserFrontDossierLead,
  TeaserFrontDossierMore,
  DossierTag,
  DossierTile,
  DossierTileHeadline,
  DossierTileLead,
  DossierTileRow
} from '../../components/Dossier'

import {
  matchTeaser,
  matchTeaserType,
  extractImage,
  globalInlines,
  styles
} from '../Article/utils'

const image = {
  matchMdast: matchImageParagraph,
  component: () => null,
  isVoid: true
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
      placeholder: 'Credit'
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
              : colors.primary
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

  const lead = {
    matchMdast: matchHeading(4),
    component: ({ children, attributes }) =>
      <TeaserFrontLead attributes={attributes}>
        {children}
      </TeaserFrontLead>,
    editorModule: 'headline',
    editorOptions: {
      type: 'FRONTLEAD',
      placeholder: 'Lead',
      depth: 4,
      optional: true
    },
    rules: globalInlines
  }

  const format = {
    matchMdast: matchHeading(6),
    component: ({ children, attributes, href }) =>
      <Editorial.Format attributes={attributes}>
        <Link href={href} passHref>
          <a href={href} {...styles.link}>
            {children}
          </a>
        </Link>
      </Editorial.Format>,
    props (node, index, parent, { ancestors }) {
      const teaser = ancestors.find(matchTeaser)
      return {
        href: teaser
          ? teaser.data.formatUrl
          : undefined
      }
    },
    editorModule: 'headline',
    editorOptions: {
      type: 'FRONTFORMAT',
      placeholder: 'Format',
      depth: 6,
      optional: true
    },
    rules: globalInlines
  }

  const frontImageTeaser = {
    matchMdast: matchTeaserType('frontImage'),
    props: node => ({
      image: extractImage(node.children[0]),
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
      insertButton: 'Front Image',
      formOptions: [
        'textPosition',
        'color',
        'bgColor',
        'center',
        'image'
      ]
    },
    rules: [
      image,
      title(
        'FRONTIMAGETITLE',
        ({ children, attributes, kind }) => {
          const Component = kind === 'editorial'
            ? TeaserFrontImageHeadline.Editorial
            : TeaserFrontImageHeadline.Interaction
          return <Component attributes={attributes}>
            {children}
          </Component>
        }
      ),
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
    props: node => ({
      image: extractImage(node.children[0]),
      ...node.data
    }),
    editorModule: 'teaser',
    editorOptions: {
      type: 'FRONTSPLIT',
      teaserType: 'frontSplit',
      insertButton: 'Front Split',
      formOptions: [
        'color',
        'bgColor',
        'center',
        'image',
        'kind',
        'titleSize',
        'reverse',
        'portrait'
      ]
    },
    rules: [
      image,
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
      insertButton: 'Front Typo',
      formOptions: [
        'color',
        'bgColor',
        'kind',
        'titleSize'
      ]
    },
    rules: [
      image,
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
    props: node => ({
      image: extractImage(node.children[0]),
      ...node.data
    }),
    editorModule: 'teaser',
    editorOptions: {
      type: 'FRONTTILE',
      teaserType: 'frontTile',
      insertButton: 'Front Tile',
      dnd: false,
      formOptions: [
        'color',
        'bgColor',
        'center',
        'showImage',
        'image',
        'kind'
      ]
    },
    rules: [
      image,
      title(
        'FRONTTILETITLE',
        ({ children, attributes, kind }) => {
          const Component = kind === 'editorial'
          ? TeaserFrontTileHeadline.Editorial
          : TeaserFrontTileHeadline.Interaction
          return (
            <Component attributes={attributes}>
              {children}
            </Component>
          )
        }
      ),
      lead,
      format,
      credit
    ]
  }

  const articleCollectionLead = {
    matchMdast: matchHeading(4),
    component: ({ children, attributes }) =>
      <TeaserFrontDossierLead attributes={attributes}>
        {children}
      </TeaserFrontDossierLead>,
    editorModule: 'headline',
    editorOptions: {
      type: 'ARTICLECOLLECTIONLEAD',
      placeholder: 'Lead',
      depth: 4,
      optional: true
    },
    rules: globalInlines
  }

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

  const articleTile = {
    matchMdast: matchTeaserType('articleTile'),
    component: ({ children, attributes, ...props }) => (
      <Link href={props.url}>
        <DossierTile attributes={attributes} {...props}>
          {children}
        </DossierTile>
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
        'image',
        'kind'
      ]
    },
    rules: [
      image,
      title(
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
      format,
      credit
    ]
  }

  const articleTileRow = {
    matchMdast: matchZone('TEASERGROUP'),
    component: ({ children, attributes, ...props }) => {
      return <DossierTileRow attributes={attributes} {...props}>
        {children}
      </DossierTileRow>
    },
    // TMP: Disabled until editor integration
    // editorModule: 'teasergroup',
    editorOptions: {
      type: 'ARTICLETILEROW'
    },
    rules: [
      articleTile
    ]
  }

  const articleCollectionIntro = {
    matchMdast: node => {
      return matchZone('ARTICLECOLLECTIONINTRO')(node)
    },
    props: node => ({
      image: extractImage(node.children[0]),
      ...node.data
    }),
    component: ({ children, attributes, ...props }) => {
      return <TeaserFrontDossierIntro attributes={attributes} {...props}>
        {children}
      </TeaserFrontDossierIntro>
    },
    editorModule: 'teaser',
    editorOptions: {
      type: 'ARTICLECOLLECTIONINTRO'
    },
    rules: [
      image,
      {
        matchMdast: matchHeading(6),
        component: ({ children, attributes }) => (
          <DossierTag attributes={attributes}>
            {children}
          </DossierTag>
        ),
        editorModule: 'headline',
        editorOptions: {
          type: 'DOSSIERTAG',
          placeholder: 'Dossier',
          depth: 1
        }
      },
      title(
        'ARTICLECOLLECTIONTITLE',
        ({ children, attributes, ...props }) => (
          <Link href={props.url}>
            <TeaserFrontDossierHeadline attributes={attributes}>
              {children}
            </TeaserFrontDossierHeadline>
          </Link>
        )
      ),
      articleCollectionLead
    ]
  }

  const frontArticleCollectionTeaser = {
    matchMdast: matchTeaserType('frontArticleCollection'),
    component: ({ children, attributes, ...props }) => {
      return <TeaserFrontDossier attributes={attributes} {...props}>
        {children}
      </TeaserFrontDossier>
    },
    // TMP: Disabled until editor integration
    // editorModule: 'teaser',
    editorOptions: {
      type: 'FRONTARTICLECOLLECTION',
      insertButton: 'Artikelsammlung / Dossier'
    },
    rules: [
      articleCollectionIntro,
      articleTileRow,
      {
        matchMdast: matchParagraph,
        component: ({ children }) => children,
        editorModule: 'paragraph',
        rules: [
          {
            matchMdast: matchType('link'),
            props: node => ({
              title: node.title,
              href: node.url
            }),
            component: ({ children, attributes, ...props }) => {
              return (
              <Link href={props.href} passHref>
                <a href={props.href}>
                  <TeaserFrontDossierMore attributes={attributes}>
                    {children}
                  </TeaserFrontDossierMore>
                 </a>
              </Link>
            )},
            editorModule: 'link'
          }
        ]
      }
    ]
  }

  const schema = {
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
          frontArticleCollectionTeaser,
          {
            matchMdast: node => {
              return matchZone('TEASERGROUP')(node)
            },
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
          {
            editorModule: 'specialchars'
          }
        ]
      }
    ]
  }

  return schema
}

export default createSchema
