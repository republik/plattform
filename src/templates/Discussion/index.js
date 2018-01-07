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
