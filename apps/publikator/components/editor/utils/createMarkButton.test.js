import React from 'react'
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
              text: 'Hello MarkButton!',
            },
          ],
        },
      ],
    },
    {
      kind: 'block',
      type: 'lead',
      nodes: [
        {
          kind: 'text',
          leaves: [
            {
              text: 'We are blocks at your service.',
            },
          ],
        },
      ],
    },
    {
      kind: 'block',
      type: 'paragraph',
      nodes: [
        {
          kind: 'text',
          leaves: [
            {
              text: 'Tamper with us',
            },
          ],
        },
      ],
    },
  ],
}

const initialState = Value.fromJSON({
  document: rawDoc,
})
const Button = () => <span />
const MarkButton = createMarkButton({ type: 'bold' })(Button)

describe('createMarkButton test-suite', () => {
  it('utils.createMarkButton: blurred', () => {
    const value = initialState

    const wrapper = shallow(<MarkButton value={value} />)

    // renders as disabled and inactive
    expect(
      !wrapper.find('Button').prop('active') &&
        wrapper.find('Button').prop('disabled'),
    ).toBeTruthy()
  })

  it('utils.createMarkButton: focused cursor on text without marks', () => {
    const value = initialState
      .change()
      .select({
        anchorKey: initialState.document.nodes.get(0).nodes.first().key,
        anchorOffset: 2,
        focusKey: initialState.document.nodes.get(0).nodes.first().key,
        focusOffset: 2,
      })
      .focus().value

    const wrapper = shallow(<MarkButton value={value} />)

    // renders as disabled and inactive
    expect(
      !wrapper.find('Button').prop('active') &&
        wrapper.find('Button').prop('disabled'),
    ).toBeTruthy()
  })

  it('utils.createMarkButton: focused cursor on text with the given mark', () => {
    const value = initialState
      .change()
      .select({
        anchorKey: initialState.document.nodes.get(1).nodes.first().key,
        anchorOffset: 2,
        focusKey: initialState.document.nodes.get(1).nodes.first().key,
        focusOffset: 6,
      })
      .toggleMark('bold')
      .select({
        anchorKey: initialState.document.nodes.get(1).nodes.first().key,
        anchorOffset: 4,
        focusKey: initialState.document.nodes.get(1).nodes.first().key,
        focusOffset: 4,
      })
      .focus().value

    const wrapper = shallow(<MarkButton value={value} />)

    // renders as enabled and active
    expect(
      wrapper.find('Button').prop('active') &&
        !wrapper.find('Button').prop('disabled'),
    ).toBeTruthy()
  })

  it('utils.createMarkButton: selection containing text without any marks', () => {
    const value = initialState
      .change()
      .select({
        anchorKey: initialState.document.nodes.get(1).nodes.first().key,
        anchorOffset: 2,
        focusKey: initialState.document.nodes.get(1).nodes.first().key,
        focusOffset: 6,
      })
      .focus().value

    const wrapper = shallow(<MarkButton value={value} />)

    // renders as enabled and inactive
    expect(
      !wrapper.find('Button').prop('active') &&
        !wrapper.find('Button').prop('disabled'),
    ).toBeTruthy()
  })

  it('utils.createMarkButton: selection containing text with offset 0', () => {
    const value = initialState
      .change()
      .select({
        anchorKey: initialState.document.nodes.get(1).nodes.first().key,
        anchorOffset: 0,
        focusKey: initialState.document.nodes.get(1).nodes.first().key,
        focusOffset: 6,
      })
      .focus().value

    const wrapper = shallow(<MarkButton value={value} />)

    // renders as enabled
    expect(wrapper.find('Button').prop('disabled')).toBeFalsy()
  })

  it('utils.createMarkButton: selection containing text with the given mark', () => {
    const value = initialState
      .change()
      .select({
        anchorKey: initialState.document.nodes.get(1).nodes.first().key,
        anchorOffset: 2,
        focusKey: initialState.document.nodes.get(1).nodes.first().key,
        focusOffset: 6,
      })
      .toggleMark('bold')
      .select({
        anchorKey: initialState.document.nodes.get(1).nodes.first().key,
        anchorOffset: 4,
        focusKey: initialState.document.nodes.get(1).nodes.first().key,
        focusOffset: 8,
      })
      .focus().value

    const wrapper = shallow(<MarkButton value={value} />)

    // renders as enabled and active
    expect(
      wrapper.find('Button').prop('active') &&
        !wrapper.find('Button').prop('disabled'),
    ).toBeTruthy()
  })

  it('utils.createMarkButton: action on selection containing text without any marks', () => {
    const value = initialState
      .change()
      .select({
        anchorKey: initialState.document.nodes.get(1).nodes.first().key,
        anchorOffset: 2,
        focusKey: initialState.document.nodes.get(1).nodes.first().key,
        focusOffset: 6,
      })
      .focus().value

    const onChange = (change) => {
      // adds marks to all text nodes in the selection
      expect(change.value.marks.size > 0).toBeTruthy()
    }

    const event = {
      preventDefault: jest.fn(),
    }

    const wrapper = shallow(<MarkButton value={value} onChange={onChange} />)

    wrapper.find('Button').simulate('mousedown', event)
  })

  it('utils.createMarkButton: action on cursor over a text with marks', () => {
    const value = initialState
      .change()
      .select({
        anchorKey: initialState.document.nodes.get(1).nodes.first().key,
        anchorOffset: 2,
        focusKey: initialState.document.nodes.get(1).nodes.first().key,
        focusOffset: 6,
      })
      .toggleMark('bold')
      .select({
        anchorKey: initialState.document.nodes.get(1).nodes.first().key,
        anchorOffset: 4,
        focusKey: initialState.document.nodes.get(1).nodes.first().key,
        focusOffset: 4,
      })
      .focus().value

    const onChange = (change) => {
      // removes all marks on direct siblings of the text node under the cursor
      expect(change.value.marks.size).toBe(0)
    }

    const event = {
      preventDefault: jest.fn(),
    }

    const wrapper = shallow(<MarkButton value={value} onChange={onChange} />)

    wrapper.find('Button').simulate('mousedown', event)
  })

  it('utils.createMarkButton: action on selection containing mixed ranges with mixed marks', () => {
    const value = initialState
      .change()
      .select({
        anchorKey: initialState.document.nodes.get(1).nodes.first().key,
        anchorOffset: 2,
        focusKey: initialState.document.nodes.get(1).nodes.first().key,
        focusOffset: 6,
      })
      .toggleMark('bold')
      .moveOffsetsTo(4, 10)
      .focus().value

    const onChange = (change) => {
      // extends the given mark to all text nodes in the selection
      expect(change.value.marks.size).toBe(1)
    }

    const event = {
      preventDefault: jest.fn(),
    }

    const wrapper = shallow(<MarkButton value={value} onChange={onChange} />)

    // renders as enabled and active
    expect(
      wrapper.find('Button').prop('active') &&
        !wrapper.find('Button').prop('disabled'),
    ).toBeTruthy()

    wrapper.find('Button').simulate('mousedown', event)
  })

  it('utils.createMarkButton: action on selection containing only ranges with the given mark', () => {
    const value = initialState
      .change()
      .select({
        anchorKey: initialState.document.nodes.get(1).nodes.first().key,
        anchorOffset: 2,
        focusKey: initialState.document.nodes.get(1).nodes.first().key,
        focusOffset: 6,
      })
      .toggleMark('bold')
      .moveStart(1)
      .moveEnd(-1)
      .focus().value

    const onChange = (change) => {
      // removes the mark only from ranges in the selection
      expect(change.value.marks.size).toBe(0)
    }

    const event = {
      preventDefault: jest.fn(),
    }

    const wrapper = shallow(<MarkButton value={value} onChange={onChange} />)

    // renders as enabled and active
    expect(
      wrapper.find('Button').prop('active') &&
        !wrapper.find('Button').prop('disabled'),
    ).toBeTruthy()

    wrapper.find('Button').simulate('mousedown', event)
  })
})
