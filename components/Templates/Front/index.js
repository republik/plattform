import {
  matchType,
  matchZone,
  matchParagraph,
  matchHeading,
  matchImageParagraph
} from 'mdast-react-render/lib/utils'
import {
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
  TeaserFrontTileRow,
  TeaserFrontTile,
  TeaserFrontTileHeadline
} from '@project-r/styleguide'

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
      props: (node, index, parent) => ({
        data: {
          title: node.title,
          href: node.url
        },
        color: parent.data.linkColor
      }),
      component: ({ children, data, attributes = {} }) =>
        <TeaserFrontAuthorLink
          href={data.href}
          title={data.title}
          {...attributes}>
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
    depth: 4
  }
})

const format = type => ({
  matchMdast: matchHeading(6),
  component: ({ children, attributes = {} }) =>
    <Editorial.Format {...attributes}>
      {children}
    </Editorial.Format>,
  editorModule: 'headline',
  editorOptions: {
    type,
    placeholder: 'Format',
    depth: 6
  }
})

const image = {
  matchMdast: matchImageParagraph,
  component: () => null,
  isVoid: true
}

const frontImageTeaser = {
  matchMdast: node => {
    return matchZone('TEASER')(node) && node.data.teaserType === 'frontImage'
  },
  component: ({ children, attributes = {}, ...props }) => {
    return <TeaserFrontImage {...attributes} {...props}>
      {children}
    </TeaserFrontImage>
  },

  editorModule: 'teaser',
  editorOptions: {
    type: 'frontImage',
    teaserType: 'frontImage',
    insertButton: 'Front Image'
  },
  rules: [
    image,
    title(
      'frontImageTitle',
      ({ children, attributes = {}, ...props }) => {
        const { kind, titleSize } = props
        const Component = kind === 'editorial'
          ? TeaserFrontImageHeadline.Editorial
          : TeaserFrontImageHeadline.Interaction
        const sizes = {
          medium: titleSize === 'medium',
          large: titleSize === 'large'
        }
        return <Component {...attributes} {...sizes}>
          {children}
        </Component>
      }
    ),
    lead(
      'frontImageLead',
      ({ children, attributes = {} }) =>
        <TeaserFrontLead {...attributes}>
          {children}
        </TeaserFrontLead>
    ),
    format('frontImageFormat'),
    paragraph(
      'frontImageCredit',
      ({ children, attributes = {} }) =>
        <TeaserFrontCredit {...attributes}>{children}</TeaserFrontCredit>
    )
  ]
}

const frontSplitTeaser = {
  matchMdast: node => {
    return matchZone('TEASER')(node) && node.data.teaserType === 'frontSplit'
  },
  component: ({ children, attributes = {}, ...props }) => {
    return <TeaserFrontSplit {...attributes} {...props}>
      {children}
    </TeaserFrontSplit>
  },

  editorModule: 'teaser',
  editorOptions: {
    type: 'frontSplit',
    teaserType: 'frontSplit',
    insertButton: 'Front Split'
  },
  rules: [
    image,
    title(
      'frontSplitTitle',
      ({ children, attributes = {}, ...props }) => {
        const { kind, titleSize } = props
        const Component = kind === 'editorial'
          ? TeaserFrontSplitHeadline.Editorial
          : TeaserFrontSplitHeadline.Interaction
        const sizes = {
          medium: titleSize === 'medium',
          large: titleSize === 'large'
        }
        return <Component {...attributes} {...sizes}>
          {children}
        </Component>
      }
    ),
    lead(
      'frontSplitLead',
      ({ children, attributes = {} }) =>
        <TeaserFrontLead {...attributes}>
          {children}
        </TeaserFrontLead>
    ),
    format('frontSplitFormat'),
    paragraph(
      'frontSplitCredit',
      ({ children, attributes = {} }) =>
        <TeaserFrontCredit {...attributes}>{children}</TeaserFrontCredit>
    )
  ]
}

const frontTypoTeaser = {
  matchMdast: node => {
    return matchZone('TEASER')(node) && node.data.teaserType === 'frontTypo'
  },
  component: ({ children, attributes = {}, ...props }) => {
    return <TeaserFrontTypo {...attributes} {...props}>
      {children}
    </TeaserFrontTypo>
  },
  editorModule: 'teaser',
  editorOptions: {
    type: 'frontTypo',
    teaserType: 'frontTypo',
    insertButton: 'Front Typo'
  },
  rules: [
    image,
    title(
      'frontTypoTitle',
      ({ children, attributes = {}, ...props }) => {
        const { kind, titleSize } = props
        const Component = kind === 'editorial'
        ? TeaserFrontTypoHeadline.Editorial
        : TeaserFrontTypoHeadline.Interaction
        const sizes = {
          medium: titleSize === 'medium',
          large: titleSize === 'large'
        }
        return <Component {...attributes} {...sizes}>
          {children}
        </Component>
      }
    ),
    lead(
      'frontTypoLead',
      ({ children, attributes = {} }) =>
        <TeaserFrontLead {...attributes}>
          {children}
        </TeaserFrontLead>
    ),
    format('frontTypoFormat'),
    paragraph(
      'frontTypoCredit',
      ({ children, attributes = {} }) =>
        <TeaserFrontCredit {...attributes}>{children}</TeaserFrontCredit>
    )
  ]
}

const frontTileTeaser = {
  matchMdast: node => {
    return matchZone('TEASER')(node) && node.data.teaserType === 'frontTile'
  },
  component: ({ children, attributes = {}, ...props }) => {
    return <TeaserFrontTile {...attributes} {...props}>
      {children}
    </TeaserFrontTile>
  },
  editorModule: 'teaser',
  editorOptions: {
    type: 'frontTile',
    teaserType: 'frontTile',
    insertButton: 'Front Tile'
  },
  rules: [
    image,
    title(
      'frontTileTitle',
      ({ children, attributes = {}, ...props }) => {
        const { kind, titleSize } = props
        const Component = kind === 'editorial'
        ? TeaserFrontTileHeadline.Editorial
        : TeaserFrontTileHeadline.Interaction
        const sizes = {
          medium: titleSize === 'medium',
          large: titleSize === 'large'
        }
        return <Component {...attributes} {...sizes}>
          {children}
        </Component>
      }
    ),
    lead(
      'frontTileLead',
      ({ children, attributes = {} }) =>
        <TeaserFrontLead {...attributes}>
          {children}
        </TeaserFrontLead>
    ),
    format('frontTileFormat'),
    paragraph(
      'frontTileCredit',
      ({ children, attributes = {} }) =>
        <TeaserFrontCredit {...attributes}>{children}</TeaserFrontCredit>
    )
  ]
}

const schema = {
  rules: [
    {
      matchMdast: matchType('root'),
      component: ({ children, attributes = {} }) =>
        <div {...attributes} style={{padding: '20px 0'}}>{children}</div>,
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
          matchMdast: matchZone('TEASERGROUP'),
          component: ({ children, attributes = {}, ...props }) =>
            <TeaserFrontTileRow {...attributes} {...props}>
              {children}
            </TeaserFrontTileRow>,
          editorModule: 'teasergroup',
          editorOptions: {
            type: 'frontTileRow',
            insertButton: 'Front Tile Row'
          },
          rules: [
            frontTileTeaser
          ]
        }
      ]
    }
  ]
}

export default schema
