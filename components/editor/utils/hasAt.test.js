import test from 'tape'
import { Raw, Schema } from 'slate'
import { matchBlock, matchDocument } from './'
import hasAt from './hasAt'

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
    hasAt(
      1,
      matchDocument,
      matchBlock('lead'),
      () => 'lead'
    )
  ]
}

test('hasAt: valid state', assert => {
  assert.plan(1)

  const state = initialState
    .transform()
    .normalize(
      Schema.create(schema)
    )
    .apply()
  assert.equal(
    state,
    initialState,
    'leaves a valid node untouched'
  )
})

test('hasAt: invalid state', assert => {
  assert.plan(1)

  let state = initialState
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
    'lead',
    'normalizes the node at index if it did not match `matchChild`.'
  )
})
