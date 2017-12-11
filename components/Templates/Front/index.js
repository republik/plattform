import {
  matchType,
  matchZone,
  matchParagraph,
  matchHeading,
  matchImageParagraph
} from 'mdast-react-render/lib/utils'
import {
  colors,
  TeaserFrontImage,
  Editorial,
  TeaserFrontImageHeadline,
  TeaserFrontLead,
  TeaserFrontCredit,
  TeaserFrontAuthorLink,
  TeaserFrontTypo,
  TeaserFrontTypoHeadline,
  TeaserFrontSplitHeadline,
  TeaserFrontSplit,
  TeaserFrontTile,
  TeaserFrontTileHeadline,
  TeaserFrontTileRow
} from '@project-r/styleguide'

const matchTeaser = matchZone('TEASER')
const matchTeaserType = teaserType =>
  node => matchTeaser(node) && node.data.teaserType === teaserType

const paragraph = (type, component) => ({
  matchMdast: matchParagraph,
  component,
  editorModule: 'paragraph',
  editorOptions: {
    type,
    placeholder: 'Credit'
  },
  rules: [
    {
      matchMdast: matchType('link'),
      props: (node, index, parent, { ancestors }) => {
        const teaser = ancestors.find(matchTeaser)
        return {
          data: {
            title: node.title,
            href: node.url
          },
          color: teaser
            ? teaser.data.linkColor
            : colors.primary
        }
      },
      component: ({ children, data, attributes, ...props }) =>
        <TeaserFrontAuthorLink
          {...props}
          attributes={attributes}>
          {children}
        </TeaserFrontAuthorLink>,
      editorModule: 'link',
      editorOptions: {
        type: 'teaserLink'
      }
    }
  ]
})

const title = (type, component) => ({
  matchMdast: matchHeading(1),
  component,
  props (node, index, parent) {
    return {
      kind: parent.data.kind,
      titleSize: parent.data.titleSize
    }
  },
  editorModule: 'headline',
  editorOptions: {
    type,
    placeholder: 'Titel',
    depth: 1
  }
})

const lead = (type, component) => ({
  matchMdast: matchHeading(4),
  component,
  editorModule: 'headline',
  editorOptions: {
    type,
    placeholder: 'Lead',
    depth: 4,
    optional: true
  }
})

const format = type => ({
  matchMdast: matchHeading(6),
  component: ({ children, attributes }) =>
    <Editorial.Format attributes={attributes}>
      {children}
    </Editorial.Format>,
  editorModule: 'headline',
  editorOptions: {
    type,
    placeholder: 'Format',
    depth: 6,
    optional: true
  }
})

const image = {
  matchMdast: matchImageParagraph,
  component: () => null,
  isVoid: true
}

const extracImage = node => matchImageParagraph(node)
  ? node.children[0].url
  : undefined

const frontImageTeaser = {
  matchMdast: matchTeaserType('frontImage'),
  props: node => ({
    image: extracImage(node.children[0]),
    ...node.data
  }),
  component: ({ children, attributes, image, ...props }) => {
    const imageSrc = image || '/static/placeholder.png'
    return <TeaserFrontImage image={imageSrc} attributes={attributes} {...props}>
      {children}
    </TeaserFrontImage>
  },
  editorModule: 'teaser',
  editorOptions: {
    type: 'frontImage',
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
      'frontImageTitle',
      ({ children, attributes, kind }) => {
        const Component = kind === 'editorial'
          ? TeaserFrontImageHeadline.Editorial
          : TeaserFrontImageHeadline.Interaction
        return <Component attributes={attributes}>
          {children}
        </Component>
      }
    ),
    lead(
      'frontImageLead',
      ({ children, attributes }) =>
        <TeaserFrontLead attributes={attributes}>
          {children}
        </TeaserFrontLead>
    ),
    format('frontImageFormat'),
    paragraph(
      'frontImageCredit',
      ({ children, attributes }) =>
        <TeaserFrontCredit attributes={attributes}>{children}</TeaserFrontCredit>
    )
  ]
}

const frontSplitTeaser = {
  matchMdast: matchTeaserType('frontSplit'),
  component: ({ children, attributes, image, ...props }) => {
    const imageSrc = image || '/static/placeholder.png'
    return <TeaserFrontSplit image={imageSrc} attributes={attributes} {...props}>
      {children}
    </TeaserFrontSplit>
  },
  props: node => ({
    image: extracImage(node.children[0]),
    ...node.data
  }),
  editorModule: 'teaser',
  editorOptions: {
    type: 'frontSplit',
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
      'frontSplitTitle',
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
    lead(
      'frontSplitLead',
      ({ children, attributes }) =>
        <TeaserFrontLead attributes={attributes}>
          {children}
        </TeaserFrontLead>
    ),
    format('frontSplitFormat'),
    paragraph(
      'frontSplitCredit',
      ({ children, attributes }) =>
        <TeaserFrontCredit attributes={attributes}>{children}</TeaserFrontCredit>
    )
  ]
}

const frontTypoTeaser = {
  matchMdast: matchTeaserType('frontTypo'),
  component: ({ children, attributes, ...props }) => {
    return <TeaserFrontTypo attributes={attributes} {...props}>
      {children}
    </TeaserFrontTypo>
  },
  props (node) {
    return node.data
  },
  editorModule: 'teaser',
  editorOptions: {
    type: 'frontTypo',
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
      'frontTypoTitle',
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
    lead(
      'frontTypoLead',
      ({ children, attributes }) =>
        <TeaserFrontLead attributes={attributes}>
          {children}
        </TeaserFrontLead>
    ),
    format('frontTypoFormat'),
    paragraph(
      'frontTypoCredit',
      ({ children, attributes }) =>
        <TeaserFrontCredit attributes={attributes}>{children}</TeaserFrontCredit>
    )
  ]
}

const frontTileTeaser = {
  matchMdast: matchTeaserType('frontTile'),
  component: ({ children, attributes, image, ...props }) => {
    const imageSrc = image || '/static/placeholder.png'
    return <TeaserFrontTile image={imageSrc} attributes={attributes} {...props}>
      {children}
    </TeaserFrontTile>
  },
  props: node => ({
    image: extracImage(node.children[0]),
    ...node.data
  }),
  editorModule: 'teaser',
  editorOptions: {
    type: 'frontTile',
    teaserType: 'frontTile',
    insertButton: 'Front Tile',
    dnd: false,
    formOptions: [
      'color',
      'bgColor',
      'linkColor',
      'center',
      'image',
      'kind'
    ]
  },
  rules: [
    image,
    title(
      'frontTileTitle',
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
    lead(
      'frontTileLead',
      ({ children, attributes }) =>
        <TeaserFrontLead attributes={attributes}>
          {children}
        </TeaserFrontLead>
    ),
    format('frontTileFormat'),
    paragraph(
      'frontTileCredit',
      ({ children, attributes }) =>
        <TeaserFrontCredit attributes={attributes}>{children}</TeaserFrontCredit>
    )
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
            type: 'frontTileRow',
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

export default schema
