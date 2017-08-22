import test from 'tape'
import { Raw, Schema } from 'slate'
import { matchBlock, matchDocument } from './'
import hasOnlyOne from './hasOnlyOne'

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
              text: 'Hello hasOnlyOne!'
            }
          ]
        }
      ]
    },
    {
      kind: 'block',
      type: 'title',
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
    hasOnlyOne(
      matchDocument,
      matchBlock('title'),
      () => 'paragraph'
    )
  ]
}

test('hasOnlyOne: valid state', assert => {
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

test('hasOnlyOne: invalid state', assert => {
  assert.plan(4)

  let state = initialState
    .transform()
    .setNodeByKey(
      initialState.document.nodes.get(2).key,
      'title'
    )
    .normalize(
      Schema.create(schema)
    )
    .apply()

  assert.equal(
    state.document.nodes.get(2).type,
    'paragraph',
    'normalizes all matched nodes after the first one.'
  )

  assert.equal(
    state.document.nodes.get(1),
    initialState.document.nodes.get(1),
    'leaves the first match untouched.'
  )

  state = initialState
    .transform()
    .setNodeByKey(
      initialState.document.nodes.get(0).key,
      'title'
    )
    .normalize(
      Schema.create(schema)
    )
    .apply()

  assert.equal(
    state.document.nodes.get(0).type,
    'title',
    'keeps the new first match if its index is lower than the current one\'s'
  )

  assert.equal(
    state.document.nodes.get(1).type,
    'paragraph',
    'reverts the old first match if its index is higher than a newer one\'s'
  )
})
