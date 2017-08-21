import React from 'react'
import test from 'tape'
import spy from 'spy'
import { shallow } from 'enzyme'
import createBlockButton from './createBlockButton'
import { Raw } from 'slate'

const rawDoc = {
  'nodes': [
    {
      kind: 'block',
      type: 'paragraph',
      nodes: [
        {
          kind: 'text',
          ranges: [
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
          ranges: [
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
          ranges: [
            {
              text: 'Tamper with us'
            }
          ]
        }
      ]
    }
  ]
}

const initialState = Raw.deserialize(rawDoc, { terse: true })
const Button = () => <span />
const BlockButton = createBlockButton('lead')(Button)

test('utils.createBlockButton: blurred', assert => {
  assert.plan(1)
  const state = initialState

  const BlockButton = createBlockButton('lead')(Button)

  const wrapper = shallow(
    <BlockButton
      state={state}
    />
  )

  assert.equal(
    !wrapper.find('Button').prop('active') && wrapper.find('Button').prop('disabled'),
    true,
    'renders as disabled and inactive'
  )
})

test('utils.createBlockButton: focused cursor', assert => {
  assert.plan(1)

  const state = initialState
    .transform()
    .select({
      anchorKey: initialState.document.nodes.get(0).nodes.first().key,
      anchorOffset: 2,
      focusKey: initialState.document.nodes.get(0).nodes.first().key,
      focusOffset: 2
    })
    .focus()
    .apply()

  const wrapper = shallow(
    <BlockButton
      state={state}
    />
  )

  assert.equal(
    !wrapper.find('Button').prop('active') && !wrapper.find('Button').prop('disabled'),
    true,
    'renders as enabled and inactive'
  )
})

test('utils.createBlockButton: focused cursor on `blockType`', assert => {
  assert.plan(1)

  const state = initialState
    .transform()
    .select({
      anchorKey: initialState.document.nodes.get(1).nodes.first().key,
      anchorOffset: 2,
      focusKey: initialState.document.nodes.get(1).nodes.first().key,
      focusOffset: 2
    })
    .focus()
    .apply()

  const wrapper = shallow(
    <BlockButton
      state={state}
    />
  )

  assert.equal(
    wrapper.find('Button').prop('active') && wrapper.find('Button').prop('disabled'),
    true,
    'renders as disabled and active'
  )
})

test('utils.createBlockButton: focused selection of mixed block types', assert => {
  assert.plan(1)

  const state = initialState
    .transform()
    .select({
      anchorKey: initialState.document.nodes.get(0).nodes.first().key,
      anchorOffset: 5,
      focusKey: initialState.document.nodes.get(1).nodes.first().key,
      focusOffset: 2
    })
    .focus()
    .apply()

  const wrapper = shallow(
    <BlockButton
      state={state}
    />
  )

  assert.equal(
    wrapper.find('Button').prop('active') && !wrapper.find('Button').prop('disabled'),
    true,
    'renders as enabled and active'
  )
})

test('utils.createBlockButton: action on focused cursor', assert => {
  assert.plan(1)

  const state = initialState
    .transform()
    .select({
      anchorKey: initialState.document.nodes.get(0).nodes.first().key,
      anchorOffset: 2,
      focusKey: initialState.document.nodes.get(0).nodes.first().key,
      focusOffset: 2
    })
    .focus()
    .apply()

  const onChange = state =>
      assert.equal(
        state.document.nodes.get(0).type,
        'lead',
        'sets the block at the cursor to `blockType`'
      )

  const event = {
    preventDefault: spy()
  }

  const wrapper = shallow(
    <BlockButton
      state={state}
      onChange={onChange}
    />
  )

  wrapper.find('Button').simulate('mousedown', event)
})

test('utils.createBlockButton: action on mixed selection', assert => {
  assert.plan(1)

  const state = initialState
    .transform()
    .select({
      anchorKey: initialState.document.nodes.get(0).nodes.first().key,
      anchorOffset: 2,
      focusKey: initialState.document.nodes.get(1).nodes.first().key,
      focusOffset: 5
    })
    .focus()
    .apply()

  const onChange = state =>
      assert.equal(
        state.document.nodes.get(0).type,
        'lead',
        'sets all blocks in the selection that were not of type `blockType` to it'
      )

  const event = {
    preventDefault: spy()
  }

  const wrapper = shallow(
    <BlockButton
      state={state}
      onChange={onChange}
    />
  )

  wrapper.find('Button').simulate('mousedown', event)
})
