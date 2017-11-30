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
  TeaserFrontAuthorLink
} from '@project-r/styleguide'

const paragraph = component => ({
  matchMdast: matchParagraph,
  component,
  editorModule: 'paragraph',
  editorOptions: {
    type: 'credit',
    placeholder: 'Credit'
  },
  rules: [
    {
      matchMdast: matchType('link'),
      props: node => ({
        data: {
          title: node.title,
          href: node.url
        }
      }),
      component: ({ children, data, attributes = {} }) =>
        <TeaserFrontAuthorLink
          href={data.href}
          title={data.title}
          {...attributes}>
          {children}
        </TeaserFrontAuthorLink>,
      editorModule: 'link'
    }
  ]
})

const title = component => ({
  matchMdast: matchHeading(1),
  component,
  editorModule: 'headline',
  editorOptions: {
    type: 'title',
    placeholder: 'Titel',
    depth: 1
  }
})

const lead = component => ({
  matchMdast: matchHeading(4),
  component,
  editorModule: 'headline',
  editorOptions: {
    type: 'lead',
    placeholder: 'Lead',
    depth: 4
  }
})

const format = {
  matchMdast: matchHeading(6),
  component: ({ children, attributes = {} }) =>
    <Editorial.Format {...attributes}>
      {children}
    </Editorial.Format>,
  editorModule: 'headline',
  editorOptions: {
    type: 'format',
    placeholder: 'Format',
    depth: 6
  }
}

const image = {
  matchMdast: matchImageParagraph,
  component: () => null,
  isVoid: true
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
        {
          matchMdast: node => {
            console.log(node.data)
            return matchZone('TEASER')(node) && node.data.teaserType === 'frontImage'
          },
          component: ({ children, attributes = {}, ...props }) => {
            return <TeaserFrontImage {...attributes} {...props}>
              {children}
            </TeaserFrontImage>
          },

          editorModule: 'teaser',
          editorOptions: {
            teaserType: 'frontImage'
          },
          rules: [
            image,
            title(
              ({ children, attributes = {} }) =>
                <TeaserFrontImageHeadline.Editorial {...attributes}>
                  {children}
                </TeaserFrontImageHeadline.Editorial>
            ),
            lead(
              ({ children, attributes = {} }) =>
                <TeaserFrontLead {...attributes}>
                  {children}
                </TeaserFrontLead>
            ),
            format,
            paragraph(
              ({ children, attributes = {} }) =>
                <TeaserFrontCredit {...attributes}>{children}</TeaserFrontCredit>
            )
          ]
        }
      ]
    }
  ]
}

export default schema
