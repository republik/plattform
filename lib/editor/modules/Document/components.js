import { createElement } from 'react'

const Document = get => props =>
  createElement(get('Document.Blocks.Document'), props)

export default get => ({
  Document: Document(get)
})
