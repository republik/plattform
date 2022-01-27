import React from 'react'
import test from 'tape'
import spy from 'spy'
import { shallow } from '../../../test/utils/enzyme'
import createBlockButton from './createBlockButton'
import { Value } from 'slate'

const rawDoc = {
  nodes: [
    {
      kind: 'block',
      type: 'paragraph',
      nodes: [
        {
          kind: 'text',
          leaves: [
            {
              text: 'Hello BlockButton!'
            }
          ]
        }
      ]
    },
    {
      kind: 'block',
      type: 'lead',
      nodes: [
        {
          kind: 'text',
          leaves: [
            {
              text: 'We are blocks at your service.'
            }
          ]
        }
      ]
    },
    {
      kind: 'block',
      type: 'paragraph',
      nodes: [
        {
          kind: 'text',
          leaves: [
            {
              text: 'Tamper with us'
            }
          ]
        }
      ]
    }
  ]
}

const initialState = Value.fromJSON({
  document: rawDoc
})
const Button = () => <span />
const BlockButton = createBlockButton({ type: 'lead' })(Button)

test('utils.createBlockButton: blurred', assert => {
  assert.plan(1)
  const value = initialState

  const wrapper = shallow(<BlockButton value={value} />)

  assert.equal(
    !wrapper.find('Button').prop('active') &&
      wrapper.find('Button').prop('disabled'),
    true,
    'renders as disabled and inactive'
  )
})

test('utils.createBlockButton: focused cursor', assert => {
  assert.plan(1)

  const value = initialState
    .change()
    .select({
      anchorKey: initialState.document.nodes.get(0).nodes.first().key,
      anchorOffset: 2,
      focusKey: initialState.document.nodes.get(0).nodes.first().key,
      focusOffset: 2
    })
    .focus().value

  const wrapper = shallow(<BlockButton value={value} />)

  assert.equal(
    !wrapper.find('Button').prop('active') &&
      !wrapper.find('Button').prop('disabled'),
    true,
    'renders as enabled and inactive'
  )
})

test('utils.createBlockButton: focused cursor on `blockType`', assert => {
  assert.plan(1)

  const value = initialState
    .change()
    .select({
      anchorKey: initialState.document.nodes.get(1).nodes.first().key,
      anchorOffset: 2,
      focusKey: initialState.document.nodes.get(1).nodes.first().key,
      focusOffset: 2
    })
    .focus().value

  const wrapper = shallow(<BlockButton value={value} />)

  assert.equal(
    wrapper.find('Button').prop('active') &&
      wrapper.find('Button').prop('disabled'),
    true,
    'renders as disabled and active'
  )
})

test('utils.createBlockButton: focused selection of mixed block types', assert => {
  assert.plan(1)

  const value = initialState
    .change()
    .select({
      anchorKey: initialState.document.nodes.get(0).nodes.first().key,
      anchorOffset: 5,
      focusKey: initialState.document.nodes.get(1).nodes.first().key,
      focusOffset: 2
    })
    .focus().value

  const wrapper = shallow(<BlockButton value={value} />)

  assert.equal(
    wrapper.find('Button').prop('active') &&
      !wrapper.find('Button').prop('disabled'),
    true,
    'renders as enabled and active'
  )
})

test('utils.createBlockButton: action on focused cursor', assert => {
  assert.plan(1)

  const value = initialState
    .change()
    .select({
      anchorKey: initialState.document.nodes.get(0).nodes.first().key,
      anchorOffset: 2,
      focusKey: initialState.document.nodes.get(0).nodes.first().key,
      focusOffset: 2
    })
    .focus().value

  const onChange = ({ value }) =>
    assert.equal(
      value.document.nodes.get(0).type,
      'lead',
      'sets the block at the cursor to `blockType`'
    )

  const event = {
    preventDefault: spy()
  }

  const wrapper = shallow(<BlockButton value={value} onChange={onChange} />)

  wrapper.find('Button').simulate('mousedown', event)
})

test('utils.createBlockButton: action on mixed selection', assert => {
  assert.plan(1)

  const value = initialState
    .change()
    .select({
      anchorKey: initialState.document.nodes.get(0).nodes.first().key,
      anchorOffset: 2,
      focusKey: initialState.document.nodes.get(1).nodes.first().key,
      focusOffset: 5
    })
    .focus().value

  const onChange = ({ value }) =>
    assert.equal(
      value.document.nodes.get(0).type,
      'lead',
      'sets all blocks in the selection that were not of type `blockType` to it'
    )

  const event = {
    preventDefault: spy()
  }

  const wrapper = shallow(<BlockButton value={value} onChange={onChange} />)

  wrapper.find('Button').simulate('mousedown', event)
})
