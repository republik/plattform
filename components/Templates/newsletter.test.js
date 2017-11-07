import test from 'tape'
import { shallow } from 'enzyme'

import { renderMdast } from 'mdast-react-render'
import newsletterSchema from './Newsletter'
import newsletterEmailSchema from './NewsletterEmail'

import mdast from './newsletter.sample'
import mdastLegacy from './newsletter.sample.legacy'

test('render for web', assert => {
  shallow(
    renderMdast(mdast, newsletterSchema, false)
  )

  assert.end()
})

test('render legacy cover for web', assert => {
  shallow(
    renderMdast(mdastLegacy, newsletterSchema, false)
  )

  assert.end()
})

test('render for email', assert => {
  shallow(
    renderMdast(mdast, newsletterEmailSchema, false)
  )

  assert.end()
})
