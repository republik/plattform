import createArticleSchema from '../Article'

const DefaultLink = ({ children }) => children

const createSchema = ({
  customMetaFields = [],
  ...args
} = {}) => {
  return createArticleSchema({
    repoPrefix: 'discussion-',
    customMetaFields: [
      {
        label: 'Beitrag-Maximallänge',
        key: 'commentsMaxLength'
      },
      {
        label: 'Beitrag-Interval (ms)',
        key: 'commentsMinInterval'
      },
      {
        label: 'Anonymity',
        key: 'discussionAnonymity',
        items: [
          {value: 'ALLOWED', text: 'Erlaubt'},
          {value: 'ENFORCED', text: 'Zwingend'},
          {value: 'FORBIDDEN', text: 'Verboten'}
        ]
      },
      {
        label: 'Format',
        key: 'format',
        ref: 'repo'
      },
      {
        label: 'Dossier',
        key: 'dossier',
        ref: 'repo'
      },
      ...customMetaFields
    ],
    ...args
  })
}

export default createSchema
