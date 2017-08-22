import React from 'react'
import test from 'tape'
import spy from 'spy'
import { shallow } from 'enzyme'
import createMarkButton from './createMarkButton'
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
              text: 'Hello MarkButton!'
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
const MarkButton = createMarkButton({ type: 'bold' })(Button)

test('utils.createMarkButton: blurred', assert => {
  assert.plan(1)
  const state = initialState

  const wrapper = shallow(
    <MarkButton
      state={state}
    />
  )

  assert.equal(
    !wrapper.find('Button').prop('active') && wrapper.find('Button').prop('disabled'),
    true,
    'renders as disabled and inactive'
  )
})

test('utils.createMarkButton: focused cursor on text without marks', assert => {
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
    <MarkButton
      state={state}
    />
  )

  assert.equal(
    !wrapper.find('Button').prop('active') && wrapper.find('Button').prop('disabled'),
    true,
    'renders as disabled and inactive'
  )
})

test('utils.createMarkButton: focused cursor on text with the given mark', assert => {
  assert.plan(1)

  const state = initialState
    .transform()
    .select({
      anchorKey: initialState.document.nodes.get(1).nodes.first().key,
      anchorOffset: 2,
      focusKey: initialState.document.nodes.get(1).nodes.first().key,
      focusOffset: 6
    })
    .toggleMark('bold')
    .select({
      anchorKey: initialState.document.nodes.get(1).nodes.first().key,
      anchorOffset: 4,
      focusKey: initialState.document.nodes.get(1).nodes.first().key,
      focusOffset: 4
    })
    .focus()
    .apply()

  const wrapper = shallow(
    <MarkButton
      state={state}
    />
  )

  assert.equal(
    wrapper.find('Button').prop('active') && !wrapper.find('Button').prop('disabled'),
    true,
    'renders as enabled and active'
  )
})

test('utils.createMarkButton: selection containing text without any marks', assert => {
  assert.plan(1)

  const state = initialState
    .transform()
    .select({
      anchorKey: initialState.document.nodes.get(1).nodes.first().key,
      anchorOffset: 2,
      focusKey: initialState.document.nodes.get(1).nodes.first().key,
      focusOffset: 6
    })
    .focus()
    .apply()

  const wrapper = shallow(
    <MarkButton
      state={state}
    />
  )

  assert.equal(
    !wrapper.find('Button').prop('active') && !wrapper.find('Button').prop('disabled'),
    true,
    'renders as enabled and inactive'
  )
})

test('utils.createMarkButton: selection containing text with the given mark', assert => {
  assert.plan(1)

  const state = initialState
    .transform()
    .select({
      anchorKey: initialState.document.nodes.get(1).nodes.first().key,
      anchorOffset: 2,
      focusKey: initialState.document.nodes.get(1).nodes.first().key,
      focusOffset: 6
    })
    .toggleMark('bold')
    .select({
      anchorKey: initialState.document.nodes.get(1).nodes.first().key,
      anchorOffset: 4,
      focusKey: initialState.document.nodes.get(1).nodes.first().key,
      focusOffset: 8
    })
    .focus()
    .apply()

  const wrapper = shallow(
    <MarkButton
      state={state}
    />
  )

  assert.equal(
    wrapper.find('Button').prop('active') && !wrapper.find('Button').prop('disabled'),
    true,
    'renders as enabled and active'
  )
})

test('utils.createMarkButton: action on selection containing text without any marks', assert => {
  assert.plan(1)

  const state = initialState
    .transform()
    .select({
      anchorKey: initialState.document.nodes.get(1).nodes.first().key,
      anchorOffset: 2,
      focusKey: initialState.document.nodes.get(1).nodes.first().key,
      focusOffset: 6
    })
    .focus()
    .apply()

  const onChange = nextState => {
    assert.equal(
      nextState.marks.size > 0,
      true,
      'adds marks to all text nodes in the selection'
    )
  }

  const event = {
    preventDefault: spy()
  }

  const wrapper = shallow(
    <MarkButton
      state={state}
      onChange={onChange}
    />
  )

  wrapper.find('Button').simulate('mousedown', event)
})

test('utils.createMarkButton: action on cursor over a text with marks', assert => {
  assert.plan(1)

  const state = initialState
    .transform()
    .select({
      anchorKey: initialState.document.nodes.get(1).nodes.first().key,
      anchorOffset: 2,
      focusKey: initialState.document.nodes.get(1).nodes.first().key,
      focusOffset: 6
    })
    .toggleMark('bold')
    .select({
      anchorKey: initialState.document.nodes.get(1).nodes.first().key,
      anchorOffset: 4,
      focusKey: initialState.document.nodes.get(1).nodes.first().key,
      focusOffset: 4
    })
    .focus()
    .apply()

  const onChange = nextState => {
    assert.equal(
      nextState.marks.size,
      0,
      'removes all marks on direct siblings of the text node under the cursor'
    )
  }

  const event = {
    preventDefault: spy()
  }

  const wrapper = shallow(
    <MarkButton
      state={state}
      onChange={onChange}
    />
  )

  wrapper.find('Button').simulate('mousedown', event)
})

test('utils.createMarkButton: action on selection containing mixed ranges with mixed marks', assert => {
  assert.plan(2)

  const state = initialState
    .transform()
    .select({
      anchorKey: initialState.document.nodes.get(1).nodes.first().key,
      anchorOffset: 2,
      focusKey: initialState.document.nodes.get(1).nodes.first().key,
      focusOffset: 6
    })
    .toggleMark('bold')
    .moveStart(2)
    .moveEnd(2)
    .focus()
    .apply()

  const onChange = nextState => {
    assert.equal(
      nextState.marks.size,
      0,
      'removes the given mark from all text nodes in the selection'
    )
  }

  const event = {
    preventDefault: spy()
  }

  const wrapper = shallow(
    <MarkButton
      state={state}
      onChange={onChange}
    />
  )

  assert.equal(
    wrapper.find('Button').prop('active') && !wrapper.find('Button').prop('disabled'),
    true,
    'renders as enabled and active'
  )

  wrapper.find('Button').simulate('mousedown', event)
})

test('utils.createMarkButton: action on selection containing only ranges with the given mark', assert => {
  assert.plan(2)

  const state = initialState
    .transform()
    .select({
      anchorKey: initialState.document.nodes.get(1).nodes.first().key,
      anchorOffset: 2,
      focusKey: initialState.document.nodes.get(1).nodes.first().key,
      focusOffset: 6
    })
    .toggleMark('bold')
    .moveStart(1)
    .moveEnd(-1)
    .focus()
    .apply()

  const onChange = nextState => {
    assert.equal(
      nextState.marks.size,
      0,
      'removes the mark only from ranges in the selection'
    )
  }

  const event = {
    preventDefault: spy()
  }

  const wrapper = shallow(
    <MarkButton
      state={state}
      onChange={onChange}
    />
  )

  assert.equal(
    wrapper.find('Button').prop('active') && !wrapper.find('Button').prop('disabled'),
    true,
    'renders as enabled and active'
  )

  wrapper.find('Button').simulate('mousedown', event)
})
