import { shallow } from '../../../test/utils/enzyme'
import createInlineButton from './createInlineButton'
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
const InlineButton = createInlineButton({ type: 'link' })(Button)

describe('', () => {
  it('utils.createInlineButton: blurred', () => {
    const value = initialState

    const wrapper = shallow(<InlineButton value={value} />)

    // renders as disabled and inactive
    expect(
      !wrapper.find('Button').prop('active') &&
        wrapper.find('Button').prop('disabled'),
    ).toBeTruthy()
  })

  it('utils.createInlineButton: focused cursor on text without inlines', () => {
    const value = initialState
      .change()
      .select({
        anchorKey: initialState.document.nodes.get(0).nodes.first().key,
        anchorOffset: 2,
        focusKey: initialState.document.nodes.get(0).nodes.first().key,
        focusOffset: 2,
      })
      .focus().value

    const wrapper = shallow(<InlineButton value={value} />)

    // renders as disabled and inactive
    expect(
      !wrapper.find('Button').prop('active') &&
        wrapper.find('Button').prop('disabled'),
    ).toBeTruthy()
  })

  it('utils.createInlineButton: focused cursor on text with the given inline', () => {
    const value = initialState
      .change()
      .select({
        anchorKey: initialState.document.nodes.get(1).nodes.first().key,
        anchorOffset: 2,
        focusKey: initialState.document.nodes.get(1).nodes.first().key,
        focusOffset: 6,
      })
      .wrapInline({
        type: 'link',
      })
      .focus().value

    const wrapper = shallow(<InlineButton value={value} />)

    // renders as enabled and active
    expect(
      wrapper.find('Button').prop('active') &&
        !wrapper.find('Button').prop('disabled'),
    ).toBeTruthy()
  })

  it('utils.createInlineButton: selection containing text without any inlines', () => {
    const value = initialState
      .change()
      .select({
        anchorKey: initialState.document.nodes.get(1).nodes.first().key,
        anchorOffset: 2,
        focusKey: initialState.document.nodes.get(1).nodes.first().key,
        focusOffset: 6,
      })
      .focus().value

    const wrapper = shallow(<InlineButton value={value} />)

    // renders as enabled and inactive
    expect(
      !wrapper.find('Button').prop('active') &&
        !wrapper.find('Button').prop('disabled'),
    ).toBeTruthy()
  })

  it('utils.createInlineButton: selection containing text with the given inline', () => {
    const value = initialState
      .change()
      .select({
        anchorKey: initialState.document.nodes.get(1).nodes.first().key,
        anchorOffset: 2,
        focusKey: initialState.document.nodes.get(1).nodes.first().key,
        focusOffset: 6,
      })
      .wrapInline({ type: 'link' })
      .moveStart(2)
      .moveEnd(2)
      .focus().value

    const wrapper = shallow(<InlineButton value={value} />)

    // renders as enabled and active
    expect(
      wrapper.find('Button').prop('active') &&
        !wrapper.find('Button').prop('disabled'),
    ).toBeTruthy()
  })

  it('utils.createInlineButton: action on selection containing text without any inlines', () => {
    const value = initialState
      .change()
      .select({
        anchorKey: initialState.document.nodes.get(1).nodes.first().key,
        anchorOffset: 2,
        focusKey: initialState.document.nodes.get(1).nodes.first().key,
        focusOffset: 6,
      })
      .focus().value

    const onChange = ({ value: nextState }) => {
      // wraps the text in the selection into an inline
      expect(nextState.inlines.size > 0).toBeTruthy()
    }

    const event = {
      preventDefault: jest.fn(),
    }

    const wrapper = shallow(<InlineButton value={value} onChange={onChange} />)

    wrapper.find('Button').simulate('mousedown', event)
  })

  it('utils.createInlineButton: action on cursor over a text wrapped in a given inline', () => {
    const value = initialState
      .change()
      .select({
        anchorKey: initialState.document.nodes.get(1).nodes.first().key,
        anchorOffset: 2,
        focusKey: initialState.document.nodes.get(1).nodes.first().key,
        focusOffset: 6,
      })
      .wrapInline({ type: 'link' })
      .moveStart(2)
      .moveEnd(-2)
      .focus().value

    const onChange = (change) => {
      // unwraps all contents of the selected inline
      expect(change.value.inlines.size).toBe(0)
    }

    const event = {
      preventDefault: jest.fn(),
    }

    const wrapper = shallow(<InlineButton value={value} onChange={onChange} />)

    wrapper.find('Button').simulate('mousedown', event)
  })

  it('utils.createInlineButton: action on selection containing text inside and outside an inline', () => {
    const value = initialState
      .change()
      .select({
        anchorKey: initialState.document.nodes.get(1).nodes.first().key,
        anchorOffset: 2,
        focusKey: initialState.document.nodes.get(1).nodes.first().key,
        focusOffset: 6,
      })
      .wrapInline({ type: 'link' })
      .moveStart(2)
      .moveEnd(2)
      .focus().value

    const onChange = (change) => {
      // unwraps all contents of the given inline
      expect(change.moveStart(-2).value.inlines.size).toBe(0)
    }

    const event = {
      preventDefault: jest.fn(),
    }

    const wrapper = shallow(<InlineButton value={value} onChange={onChange} />)

    // renders as enabled and active
    expect(
      wrapper.find('Button').prop('active') &&
        !wrapper.find('Button').prop('disabled'),
    ).toBeTruthy()

    wrapper.find('Button').simulate('mousedown', event)
  })
})
