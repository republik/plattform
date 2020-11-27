import createArticleSchema from '../Article'

const DefaultLink = ({ children }) => children

const createSchema = ({
  documentEditorOptions,
  customMetaFields = [],
  series = false,
  darkMode,
  paynotes = true,
  Link = DefaultLink,
  titleBlockPrepend = null,
  getPath = ({ slug }) => `/${(slug || '').split('/').pop()}`,
  metaHeadlines = true,
  ...args
} = {}) => {
  return createArticleSchema({
    documentEditorOptions: {
      skipCredits: true,
      titleCenter: true
    },
    repoPrefix: 'page-',
    getPath,
    customMetaFields: [
      {
        label: 'Diskussion',
        key: 'discussion',
        ref: 'repo'
      },
      {
        label: 'Action Bar ausblenden',
        key: 'disableActionBar',
        ref: 'bool'
      },
      ...customMetaFields
    ],
    series,
    darkMode,
    paynotes,
    Link,
    metaHeadlines,
    ...args
  })
}

export default createSchema
