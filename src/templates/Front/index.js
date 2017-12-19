import React from 'react'
import { css } from 'glamor'

import {
  matchType,
  matchZone,
  matchParagraph,
  matchHeading,
  matchImageParagraph
} from 'mdast-react-render/lib/utils'

import colors from '../../theme/colors'
import * as Editorial from '../../components/Typography/Editorial'
import { Sub, Sup } from '../../components/Typography'

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

const matchTeaser = matchZone('TEASER')
const matchTeaserType = teaserType =>
  node => matchTeaser(node) && node.data.teaserType === teaserType

const image = {
  matchMdast: matchImageParagraph,
  component: () => null,
  isVoid: true
}

const extractImage = node => matchImageParagraph(node)
  ? node.children[0].url
  : undefined

const styles = {
  link: css({
    color: 'inherit',
    textDecoration: 'none'
  })
}

const globalInlines = [
  {
    matchMdast: matchType('sub'),
    component: Sub,
    editorModule: 'mark',
    editorOptions: {
      type: 'sub'
    }
  },
  {
    matchMdast: matchType('sup'),
    component: Sup,
    editorModule: 'mark',
    editorOptions: {
      type: 'sup'
    }
  },
  {
    matchMdast: matchType('break'),
    component: () => <br />,
    isVoid: true
  }
]

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
              ? teaser.data.linkColor
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
        'linkColor',
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
        'linkColor',
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
        'linkColor',
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
        'linkColor',
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
