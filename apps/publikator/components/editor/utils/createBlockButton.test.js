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
              text: 'Hello BlockButton!',
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
const BlockButton = createBlockButton({ type: 'lead' })(Button)

describe('createBlockButton test-suite', () => {
  it('utils.createBlockButton: blurred', () => {
    const value = initialState

    const wrapper = shallow(<BlockButton value={value} />)

    // renders as disabled and inactive
    expect(
      !wrapper.find('Button').prop('active') &&
        wrapper.find('Button').prop('disabled'),
    ).toBeTruthy()
  })

  it('utils.createBlockButton: focused cursor', () => {
    const value = initialState
      .change()
      .select({
        anchorKey: initialState.document.nodes.get(0).nodes.first().key,
        anchorOffset: 2,
        focusKey: initialState.document.nodes.get(0).nodes.first().key,
        focusOffset: 2,
      })
      .focus().value

    const wrapper = shallow(<BlockButton value={value} />)

    // renders as enabled and inactive
    expect(
      !wrapper.find('Button').prop('active') &&
        !wrapper.find('Button').prop('disabled'),
    ).toBeTruthy()
  })

  it('utils.createBlockButton: focused cursor on `blockType`', () => {
    const value = initialState
      .change()
      .select({
        anchorKey: initialState.document.nodes.get(1).nodes.first().key,
        anchorOffset: 2,
        focusKey: initialState.document.nodes.get(1).nodes.first().key,
        focusOffset: 2,
      })
      .focus().value

    const wrapper = shallow(<BlockButton value={value} />)

    // renders as disabled and active
    expect(
      wrapper.find('Button').prop('active') &&
        wrapper.find('Button').prop('disabled'),
    ).toBeTruthy()
  })

  it('utils.createBlockButton: focused selection of mixed block types', () => {
    const value = initialState
      .change()
      .select({
        anchorKey: initialState.document.nodes.get(0).nodes.first().key,
        anchorOffset: 5,
        focusKey: initialState.document.nodes.get(1).nodes.first().key,
        focusOffset: 2,
      })
      .focus().value

    const wrapper = shallow(<BlockButton value={value} />)

    // renders as enabled and active
    expect(
      wrapper.find('Button').prop('active') &&
        !wrapper.find('Button').prop('disabled'),
    ).toBeTruthy()
  })

  it('utils.createBlockButton: action on focused cursor', () => {
    const value = initialState
      .change()
      .select({
        anchorKey: initialState.document.nodes.get(0).nodes.first().key,
        anchorOffset: 2,
        focusKey: initialState.document.nodes.get(0).nodes.first().key,
        focusOffset: 2,
      })
      .focus().value

    const onChange = ({ value }) => {
      // 'sets the block at the cursor to `blockType`',
      expect(value.document.nodes.get(0).type).toBe('lead')
    }

    const event = {
      preventDefault: jest.fn(),
    }

    const wrapper = shallow(<BlockButton value={value} onChange={onChange} />)

    wrapper.find('Button').simulate('mousedown', event)
  })

  it('utils.createBlockButton: action on mixed selection', () => {
    const value = initialState
      .change()
      .select({
        anchorKey: initialState.document.nodes.get(0).nodes.first().key,
        anchorOffset: 2,
        focusKey: initialState.document.nodes.get(1).nodes.first().key,
        focusOffset: 5,
      })
      .focus().value

    const onChange = ({ value }) =>
      // sets all blocks in the selection that were not of type `blockType` to it
      expect(value.document.nodes.get(0).type).toBe('lead')

    const event = {
      preventDefault: jest.fn(),
    }

    const wrapper = shallow(<BlockButton value={value} onChange={onChange} />)

    wrapper.find('Button').simulate('mousedown', event)
  })
})
