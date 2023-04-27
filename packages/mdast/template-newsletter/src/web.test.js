import test from 'tape'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import { renderMdast } from 'mdast-react-render'
import newsletterSchema from './web'

import mdast from './sample'
import mdastLegacy from './sample.legacy'

Enzyme.configure({ adapter: new Adapter() })

test('render for web', assert => {
  assert.doesNotThrow(() => {
    shallow(
      renderMdast(mdast, newsletterSchema, {MissingNode: false})
    )
  })

  assert.end()
})

test('render legacy cover for web', assert => {
  assert.doesNotThrow(() => {
    shallow(
      renderMdast(mdastLegacy, newsletterSchema, {MissingNode: false})
    )
  })

  assert.end()
})
