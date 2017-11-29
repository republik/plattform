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

/*
<TeaserFrontImage
  image='/static/desert.jpg'
  color='#fff' bgColor='#000'>
  <Editorial.Format>Neutrum</Editorial.Format>
  <TeaserFrontImageHeadline.Editorial>The sand is near</TeaserFrontImageHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontAuthorLink href='#' color='#adf'>Christof Moser</TeaserFrontAuthorLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontImage>

*/

const paragraph = {
  matchMdast: matchParagraph,
  component: ({ children, attributes = {} }) =>
    <TeaserFrontCredit {...attributes}>{children}</TeaserFrontCredit>,
  editorModule: 'paragraph',
  editorOptions: {
    formatButtonText: 'Paragraph'
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
}

const title = {
  matchMdast: matchHeading(1),
  component: ({ children, attributes = {} }) =>
    <TeaserFrontImageHeadline.Editorial {...attributes}>
      {children}
    </TeaserFrontImageHeadline.Editorial>,
  editorModule: 'headline',
  editorOptions: {
    type: 'title',
    placeholder: 'Titel',
    depth: 1
  }
}

const lead = {
  matchMdast: matchHeading(4),
  component: ({ children, attributes = {} }) =>
    <TeaserFrontLead {...attributes}>
      {children}
    </TeaserFrontLead>,
  editorModule: 'headline',
  editorOptions: {
    type: 'lead',
    placeholder: 'Lead',
    depth: 4
  }
}

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
          matchMdast: matchZone('TEASER'),
          component: ({ children, attributes = {}, ...props }) => {
            return <TeaserFrontImage {...attributes} {...props}>
              {children}
            </TeaserFrontImage>
          },

          editorModule: 'teaser',
          rules: [
            image,
            lead,
            title,
            format,
            paragraph
          ]
        }
      ]
    }
  ]
}

export default schema
