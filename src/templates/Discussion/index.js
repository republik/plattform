import createArticleSchema from '../Article'
import { getDatePath } from '../Article/utils'

const createSchema = ({
  customMetaFields = [],
  getPath = args => `${getDatePath(args)}/diskussion`,
  ...args
} = {}) => {
  return createArticleSchema({
    repoPrefix: 'discussion-',
    getPath,
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
          { value: 'ALLOWED', text: 'Erlaubt' },
          { value: 'ENFORCED', text: 'Zwingend' },
          { value: 'FORBIDDEN', text: 'Verboten' }
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
      {
        label: 'Diskussion geschlossen',
        key: 'discussionClosed',
        ref: 'bool'
      },
      {
        label: 'Lange Beiträge zuklappen',
        key: 'collapsable',
        ref: 'bool'
      },
      {
        label: 'Tag obligatorisch für neuen root-Beitrag',
        key: 'tagRequired',
        ref: 'bool'
      },
      {
        label: 'Tags (kommasepariert)',
        key: 'tags'
      },
      ...customMetaFields
    ],
    ...args
  })
}

export default createSchema
