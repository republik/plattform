import { toPlainText } from '@portabletext/react' // or 'next-sanity'
import { ArbitraryTypedObject, PortableTextBlock } from '@portabletext/types'
import { stegaClean } from 'next-sanity'

export function hasContent(
  value?: PortableTextBlock | ArbitraryTypedObject[] | PortableTextBlock[],
) {
  return !!value && stegaClean(toPlainText(value)).trim() !== ''
}
