import test from 'tape'
import { Raw, Schema, Block, Text } from 'slate'
import { matchDocument } from './'
import insertIfNoneAt from './insertIfNoneAt'

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
    insertIfNoneAt(
      3,
      matchDocument,
      null,
      () => Block.create({
        type: 'lead',
        nodes: [Text.createFromString('')]
      })
    )
  ]
}

test('insertIfNoneAt: valid state', assert => {
  assert.plan(1)

  const state = initialState
    .transform()
    .insertNodeByKey(
      initialState.document.key,
      3,
      Block.create({
        type: 'lead',
        nodes: [Text.createFromString('')]
      })
    )
    .apply()

  const normalizedState = state
    .transform()
    .normalize(
      Schema.create(schema)
    )
    .apply()

  assert.equal(
    state,
    normalizedState,
    'leaves a valid state untouched'
  )
})

test('insertIfNoneAt: invalid state', assert => {
  assert.plan(1)

  const normalizedState = initialState
    .transform()
    .normalize(
      Schema.create(schema)
    )
    .apply()

  assert.equal(
    normalizedState.document.nodes.get(3).type,
    'lead',
    'inserts the return value of `reducer` at `index` if no node was found.'
  )
})
