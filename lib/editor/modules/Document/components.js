import { createElement } from 'react'

export const Document = get => props =>
  createElement(get('Document.Blocks.Document'), props)
