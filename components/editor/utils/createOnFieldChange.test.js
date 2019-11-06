import test from 'tape'
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
              text: 'Hello Node w/o data!'
            }
          ]
        }
      ]
    },
    {
      kind: 'block',
      type: 'paragraph',
      data: {
        foo: 'bar'
      },
      nodes: [
        {
          kind: 'text',
          leaves: [
            {
              text: 'Hello Node with data!'
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

test('utils.createOnFieldChange: handler called with value', assert => {
  assert.plan(1)
  const paragraphNode = initialState.document.nodes.first()

  const onChange = change => {
    assert.equal(
      change.value.document.nodes.first().data.get('foo'),
      'bar',
      'sets the data[key] property to the second argument passed to the handler function'
    )
  }

  createOnFieldChange(onChange, initialState, paragraphNode, 'foo', null, 'bar')
})

test('utils.createOnFieldChange: handler called without value', assert => {
  assert.plan(1)

  const paragraphNodeWithData = initialState.document.nodes.get(1)

  const onChange = change => {
    assert.equal(
      change.value.document.nodes.get(1).data.has('foo'),
      false,
      'removes the data[key] property if the second argument passed to the handler is falsy'
    )
  }

  createOnFieldChange(
    onChange,
    initialState,
    paragraphNodeWithData,
    'foo',
    null,
    undefined
  )
})

test('utils.createOnFieldChange: partial application', assert => {
  assert.plan(1)

  const paragraphNode = initialState.document.nodes.first()

  const onChange = () => true

  const args = [onChange, initialState, paragraphNode, 'foo', null, 'bar']

  const result = args.reduce((fn, arg) => fn(arg), createOnFieldChange)

  assert.equal(typeof result !== 'function', true, 'works')
})
