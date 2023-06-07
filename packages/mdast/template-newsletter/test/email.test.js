import { renderEmail } from '@republik/mdast-react-render'

import newsletterEmailSchema from '../src/email'
import mdast from './sample'

const withSpecial = JSON.parse(JSON.stringify(mdast))
withSpecial.children[1].children.push({
  type: 'zone',
  identifier: 'SPECIAL_REPUBLIK_SHAREHOLDER',
  data: {},
  children: [],
})

describe('email rendering', () => {
  test('does not throw', () => {
    expect(() => {
      renderEmail(withSpecial, newsletterEmailSchema, { MissingNode: false })
    }).not.toThrow()
  })
})
