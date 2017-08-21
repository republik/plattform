import createFormatButton from './createFormatButton'
import createBlockButton from './createBlockButton'

export const match = kind => type => node =>
  node.kind === kind && node.type === type

export const matchBlock = match('block')

export const matchDocument = node =>
  node.kind === 'document'

export const pluginFromRules = rules =>
  ({
    schema: {
      rules
    }
  })

export default {
  match,
  matchBlock,
  matchDocument,
  pluginFromRules,
  createFormatButton,
  createBlockButton
}
