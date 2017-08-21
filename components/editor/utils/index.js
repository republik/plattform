import createFormatButton from './createFormatButton'
import createBlockButton from './createBlockButton'
import createMarkButton from './createMarkButton'
import createInlineButton from './createInlineButton'
import createPropertyForm from './createPropertyForm'

export const match = kind => type => node =>
  node.kind === kind && node.type === type

export const matchBlock = match('block')

export const matchMark = match('mark')

export const matchInline = match('inline')

export const matchDocument = node =>
  node.kind === 'document'

export const pluginFromRules = rules =>
  ({
    schema: {
      rules
    }
  })

export {
  createFormatButton,
  createBlockButton,
  createMarkButton,
  createInlineButton,
  createPropertyForm
}

export default {
  match,
  matchBlock,
  matchDocument,
  pluginFromRules,
  createFormatButton,
  createBlockButton,
  createMarkButton
}
