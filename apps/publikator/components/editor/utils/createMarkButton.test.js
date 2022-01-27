import React from 'react'
import test from 'tape'
import spy from 'spy'
import { shallow } from '../../../test/utils/enzyme'
import createMarkButton from './createMarkButton'
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
const MarkButton = createMarkButton({ type: 'bold' })(Button)

test('utils.createMarkButton: blurred', assert => {
  assert.plan(1)
  const value = initialState

  const wrapper = shallow(<MarkButton value={value} />)

  assert.equal(
    !wrapper.find('Button').prop('active') &&
      wrapper.find('Button').prop('disabled'),
    true,
    'renders as disabled and inactive'
  )
})

test('utils.createMarkButton: focused cursor on text without marks', assert => {
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

  const wrapper = shallow(<MarkButton value={value} />)

  assert.equal(
    !wrapper.find('Button').prop('active') &&
      wrapper.find('Button').prop('disabled'),
    true,
    'renders as disabled and inactive'
  )
})

test('utils.createMarkButton: focused cursor on text with the given mark', assert => {
  assert.plan(1)

  const value = initialState
    .change()
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
    .focus().value

  const wrapper = shallow(<MarkButton value={value} />)

  assert.equal(
    wrapper.find('Button').prop('active') &&
      !wrapper.find('Button').prop('disabled'),
    true,
    'renders as enabled and active'
  )
})

test('utils.createMarkButton: selection containing text without any marks', assert => {
  assert.plan(1)

  const value = initialState
    .change()
    .select({
      anchorKey: initialState.document.nodes.get(1).nodes.first().key,
      anchorOffset: 2,
      focusKey: initialState.document.nodes.get(1).nodes.first().key,
      focusOffset: 6
    })
    .focus().value

  const wrapper = shallow(<MarkButton value={value} />)

  assert.equal(
    !wrapper.find('Button').prop('active') &&
      !wrapper.find('Button').prop('disabled'),
    true,
    'renders as enabled and inactive'
  )
})

test('utils.createMarkButton: selection containing text with offset 0', assert => {
  const value = initialState
    .change()
    .select({
      anchorKey: initialState.document.nodes.get(1).nodes.first().key,
      anchorOffset: 0,
      focusKey: initialState.document.nodes.get(1).nodes.first().key,
      focusOffset: 6
    })
    .focus().value

  const wrapper = shallow(<MarkButton value={value} />)

  assert.equal(
    wrapper.find('Button').prop('disabled'),
    false,
    'renders as enabled'
  )

  assert.end()
})

test('utils.createMarkButton: selection containing text with the given mark', assert => {
  assert.plan(1)

  const value = initialState
    .change()
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
    .focus().value

  const wrapper = shallow(<MarkButton value={value} />)

  assert.equal(
    wrapper.find('Button').prop('active') &&
      !wrapper.find('Button').prop('disabled'),
    true,
    'renders as enabled and active'
  )
})

test('utils.createMarkButton: action on selection containing text without any marks', assert => {
  assert.plan(1)

  const value = initialState
    .change()
    .select({
      anchorKey: initialState.document.nodes.get(1).nodes.first().key,
      anchorOffset: 2,
      focusKey: initialState.document.nodes.get(1).nodes.first().key,
      focusOffset: 6
    })
    .focus().value

  const onChange = change => {
    assert.equal(
      change.value.marks.size > 0,
      true,
      'adds marks to all text nodes in the selection'
    )
  }

  const event = {
    preventDefault: spy()
  }

  const wrapper = shallow(<MarkButton value={value} onChange={onChange} />)

  wrapper.find('Button').simulate('mousedown', event)
})

test('utils.createMarkButton: action on cursor over a text with marks', assert => {
  assert.plan(1)

  const value = initialState
    .change()
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
    .focus().value

  const onChange = change => {
    assert.equal(
      change.value.marks.size,
      0,
      'removes all marks on direct siblings of the text node under the cursor'
    )
  }

  const event = {
    preventDefault: spy()
  }

  const wrapper = shallow(<MarkButton value={value} onChange={onChange} />)

  wrapper.find('Button').simulate('mousedown', event)
})

test('utils.createMarkButton: action on selection containing mixed ranges with mixed marks', assert => {
  assert.plan(2)

  const value = initialState
    .change()
    .select({
      anchorKey: initialState.document.nodes.get(1).nodes.first().key,
      anchorOffset: 2,
      focusKey: initialState.document.nodes.get(1).nodes.first().key,
      focusOffset: 6
    })
    .toggleMark('bold')
    .moveOffsetsTo(4, 10)
    .focus().value

  const onChange = change => {
    assert.equal(
      change.value.marks.size,
      1,
      'extends the given mark to all text nodes in the selection'
    )
  }

  const event = {
    preventDefault: spy()
  }

  const wrapper = shallow(<MarkButton value={value} onChange={onChange} />)

  assert.equal(
    wrapper.find('Button').prop('active') &&
      !wrapper.find('Button').prop('disabled'),
    true,
    'renders as enabled and active'
  )

  wrapper.find('Button').simulate('mousedown', event)
})

test('utils.createMarkButton: action on selection containing only ranges with the given mark', assert => {
  assert.plan(2)

  const value = initialState
    .change()
    .select({
      anchorKey: initialState.document.nodes.get(1).nodes.first().key,
      anchorOffset: 2,
      focusKey: initialState.document.nodes.get(1).nodes.first().key,
      focusOffset: 6
    })
    .toggleMark('bold')
    .moveStart(1)
    .moveEnd(-1)
    .focus().value

  const onChange = change => {
    assert.equal(
      change.value.marks.size,
      0,
      'removes the mark only from ranges in the selection'
    )
  }

  const event = {
    preventDefault: spy()
  }

  const wrapper = shallow(<MarkButton value={value} onChange={onChange} />)

  assert.equal(
    wrapper.find('Button').prop('active') &&
      !wrapper.find('Button').prop('disabled'),
    true,
    'renders as enabled and active'
  )

  wrapper.find('Button').simulate('mousedown', event)
})
