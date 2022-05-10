import createOnFieldChange from './createOnFieldChange'
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
              text: 'Hello Node w/o data!',
            },
          ],
        },
      ],
    },
    {
      kind: 'block',
      type: 'paragraph',
      data: {
        foo: 'bar',
      },
      nodes: [
        {
          kind: 'text',
          leaves: [
            {
              text: 'Hello Node with data!',
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

describe('createOnFieldChange util test-suite', () => {
  it('utils.createOnFieldChange: handler called with value', () => {
    const paragraphNode = initialState.document.nodes.first()

    const onChange = (change) => {
      // sets the data[key] property to the second argument passed to the handler function
      expect(change.value.document.nodes.first().data.get('foo')).toBe('bar')
    }

    createOnFieldChange(
      onChange,
      initialState,
      paragraphNode,
      'foo',
      null,
      'bar',
    )
  })

  it('utils.createOnFieldChange: handler called without value', () => {
    const paragraphNodeWithData = initialState.document.nodes.get(1)

    const onChange = (change) => {
      // removes the data[key] property if the second argument passed to the handler is falsy
      expect(change.value.document.nodes.get(1).data.has('foo')).toBeFalsy()
    }

    createOnFieldChange(
      onChange,
      initialState,
      paragraphNodeWithData,
      'foo',
      null,
      undefined,
    )
  })

  it('utils.createOnFieldChange: partial application', () => {
    const paragraphNode = initialState.document.nodes.first()

    const onChange = () => true

    const args = [onChange, initialState, paragraphNode, 'foo', null, 'bar']

    const result = args.reduce((fn, arg) => fn(arg), createOnFieldChange)

    expect(typeof result !== 'function').toBeTruthy()
  })
})
