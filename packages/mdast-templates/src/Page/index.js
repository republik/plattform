import createArticleSchema from '../Article'

const DefaultLink = ({ children }) => children

const createPageSchema = ({
  customMetaFields = [],
  series = false,
  darkMode,
  paynotes = true,
  Link = DefaultLink,
  getPath = ({ slug }) => `/${(slug || '').split('/').pop()}`,
  metaHeadlines = true,
  skipContainer = false,
  skipCenter = false,
  hasEmailTemplate = false,
  ...args
} = {}) => {
  return createArticleSchema({
    documentEditorOptions: {
      skipCredits: true,
      titleCenter: true,
    },
    repoPrefix: 'page-',
    getPath,
    hasEmailTemplate,
    customMetaFields: [
      {
        label: 'Diskussion',
        key: 'discussion',
        ref: 'repo',
      },
      {
        label: 'Action Bar ausblenden',
        key: 'disableActionBar',
        ref: 'bool',
      },
      {
        label: 'Kein synthetisches Vorlesen',
        key: 'suppressSyntheticReadAloud',
        ref: 'bool',
      },
      ...customMetaFields,
    ],
    series,
    darkMode,
    paynotes,
    Link,
    metaHeadlines,
    skipContainer,
    skipCenter,
    ...args,
  })
}

export default createPageSchema
