import test from 'tape'
import { Raw, Schema } from 'slate'
import { matchBlock, matchDocument } from './'
import hasOnlyAt from './hasOnlyAt'

const rawDoc = {
  'nodes': [
    {
      kind: 'block',
      type: 'title',
      nodes: [
        {
          kind: 'text',
          ranges: [
            {
              text: 'Hello hasOnlyOne!'
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
const schema = {
  rules: [
    hasOnlyAt(
      1,
      matchDocument,
      matchBlock('lead'),
      () => 'paragraph'
    )
  ]
}

test('hasOnlyAt: valid state', assert => {
  assert.plan(2)

  let state = initialState
    .transform()
    .normalize(
      Schema.create(schema)
    )
    .apply()

  assert.equal(
    state,
    initialState,
    'leaves the state untouched if the node at `index` is matched'
  )

  state = initialState
    .transform()
    .setNodeByKey(
      initialState.document.nodes.get(1).key,
      'title'
    )
    .normalize(
      Schema.create(schema)
    )
    .apply()

  assert.equal(
    state.document.nodes.get(1).type,
    'title',
    'leaves a the state untouched if no match occured'
  )
})

test('hasOnlyAt: invalid state', assert => {
  assert.plan(1)

  let state = initialState
    .transform()
    .setNodeByKey(
      initialState.document.nodes.get(0).key,
      'lead'
    )
    .normalize(
      Schema.create(schema)
    )
    .apply()

  assert.equal(
    state.document.nodes.get(0).type,
    'paragraph',
    'normalizes the node at index if it did not match `matchChild`.'
  )
})
