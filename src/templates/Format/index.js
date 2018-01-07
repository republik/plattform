import createArticleSchema from '../Article'

const createSchema = ({
  customMetaFields = [],
  ...args
} = {}) => {
  return createArticleSchema({
    repoPrefix: 'format-',
    customMetaFields: [
      {
        label: 'Ebene',
        key: 'kind',
        items: [
          {value: 'editorial', text: 'Editorial'},
          {value: 'meta', text: 'Meta'},
        ]
      },
      {
        label: 'Color',
        key: 'color'
      },
      {
        label: 'Dossier',
        key: 'dossier',
        ref: 'repo'
      },
      {
        label: 'Diskussion',
        key: 'discussion',
        ref: 'repo'
      },
      ...customMetaFields
    ],
    ...args
  })
}

export default createSchema
