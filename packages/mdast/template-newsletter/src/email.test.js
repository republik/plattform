import test from 'tape'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import { renderEmail } from 'mdast-react-render/lib/email'
import newsletterEmailSchema from './email'

import mdast from './sample'

const withSpecial = JSON.parse(JSON.stringify(mdast))
withSpecial.children[1].children.push({
  type: 'zone',
  identifier: 'SPECIAL_REPUBLIK_SHAREHOLDER',
  data: {},
  children: []
})

Enzyme.configure({ adapter: new Adapter() })

test('render for email', assert => {
  assert.doesNotThrow(() => {
    renderEmail(withSpecial, newsletterEmailSchema, {MissingNode: false})
  })

  assert.end()
})
