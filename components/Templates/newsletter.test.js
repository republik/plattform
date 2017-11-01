import test from 'tape'
import { shallow } from 'enzyme'

import { renderMdast, MissingMarkdownNodeType } from './'
import newsletterSchema from './Newsletter'
import newsletterEmailSchema from './NewsletterEmail'

import mdast from './newsletter.sample'

test('render for web', assert => {
  const wrapper = shallow(
    renderMdast(mdast, newsletterSchema)
  )

  wrapper.find(MissingMarkdownNodeType)
    .nodes
    .forEach(node => console.log('missing', node))

  assert.equal(
    wrapper.find(MissingMarkdownNodeType).length,
    0,
    'no missing nodes'
  )

  assert.end()
})

test('render for email', assert => {
  const wrapper = shallow(
    renderMdast(mdast, newsletterEmailSchema)
  )

  wrapper.find(MissingMarkdownNodeType)
    .nodes
    .forEach(node => console.log('missing', node))

  assert.equal(
    wrapper.find(MissingMarkdownNodeType).length,
    0,
    'no missing nodes'
  )

  assert.end()
})
