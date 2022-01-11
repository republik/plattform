import createFormatButton from './createFormatButton'
import createBlockButton from './createBlockButton'
import createMarkButton from './createMarkButton'
import createInlineButton from './createInlineButton'
import createActionButton from './createActionButton'
import createPropertyForm from './createPropertyForm'

export { default as buttonStyles } from './buttonStyles'

export const match = kind => type => node =>
  node && node.kind === kind && node.type === type

export const matchBlock = match('block')

export const matchMark = match('mark')

export const matchInline = match('inline')

export const matchDocument = node => node.kind === 'document'

export {
  createFormatButton,
  createBlockButton,
  createMarkButton,
  createInlineButton,
  createActionButton,
  createPropertyForm
}
