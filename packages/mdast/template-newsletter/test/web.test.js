import { renderMdast } from '@republik/mdast-react-render'
import newsletterSchema from '../src/web'

import mdast from './sample'
import mdastLegacy from './sample.legacy'

describe('web rendering', () => {
  test('does not throw', () => {
    expect(() => {
      renderMdast(mdast, newsletterSchema, { MissingNode: false })
    }).not.toThrow()
  })

  test('handles legacy mdast', () => {
    expect(() => {
      renderMdast(mdastLegacy, newsletterSchema, { MissingNode: false })
    }).not.toThrow()
  })
})
