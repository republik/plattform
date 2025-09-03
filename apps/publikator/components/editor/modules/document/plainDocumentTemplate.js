import { generateAuthorsLine } from '../../../../lib/utils/helpers'

const getTitleTemplate = ({ rule, titleModule, title, me }) => ({
  type: 'zone',
  identifier: titleModule.TYPE,
  data: {
    center: rule.editorOptions?.titleCenter,
  },
  children: [
    {
      type: 'heading',
      depth: 1,
      children: [
        {
          type: 'text',
          value: title,
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: 'Lead',
        },
      ],
    },
    rule.editorOptions?.skipCredits || generateAuthorsLine(me),
  ].filter(Boolean),
})

export const getPlainDocumentTemplate = ({
  schema,
  rule,
  titleModule,
  centerModule,
  repoId,
  title,
  me,
}) => ({
  type: 'root',
  repoId,
  children: [
    titleModule && getTitleTemplate({ rule, titleModule, title, me }),
    {
      type: 'zone',
      identifier: centerModule.TYPE,
      data: {},
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: titleModule ? 'Text' : title,
            },
          ],
        },
      ],
    },
  ].filter(Boolean),
  meta: {
    template: schema,
    title,
    auto: true,
    autoSlug: true,
    feed: true,
    gallery: true,
  },
})
