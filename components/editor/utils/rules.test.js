import { Record, List } from 'immutable'
import { Block, Text, Value, Document } from 'slate'
import spy from 'spy'
import test from 'tape'
import {
  rule,
  not,
  isNone,
  isEmpty,
  firstChild,
  lastChild,
  childAt,
  childrenAfter,
  filter,
  asList,
  remove,
  insertAt,
  prepend,
  append,
  update,
  unwrap
} from './rules'

const node = Document.create({
  nodes: [
    Block.create({
      kind: 'block',
      type: 'bar',
      nodes: [Text.create('Bar')]
    }),
    Block.create({
      kind: 'block',
      type: 'baz',
      nodes: [Text.create('Baz')]
    }),
    Block.create({
      kind: 'block',
      type: 'baz',
      nodes: [Text.create('Baz 2')]
    })
  ]
})

const value = Value.create({
  document: node
})

test('rules.rule', assert => {
  assert.plan(2)

  assert.deepEqual(
    rule('one', 'two', 'three'),
    { match: 'one', validate: 'two', normalize: 'three' },
    'returns an object with its keys set to the passed arguments'
  )

  assert.deepEqual(
    rule('one')('two')('three'),
    { match: 'one', validate: 'two', normalize: 'three' },
    'is a curried function'
  )
})

test('rules.isNone', assert => {
  assert.plan(1)

  assert.equal(
    isNone(node.nodes.get(4)),
    true
  )
})

test('rules.isEmpty', assert => {
  assert.plan(2)

  const emptyNode = Record({
    nodes: List()
  })()

  assert.equal(
    isEmpty(emptyNode),
    emptyNode,
    'returns the passed node if it is empty'
  )

  const nonEmptyNode = Record({
    nodes: List([ 1 ])
  })()

  assert.equal(
    isEmpty(nonEmptyNode),
    false,
    'returns false if the passed node is not empty'
  )
})

test('rules.childAt', assert => {
  assert.plan(5)

  const isBar = spy(n => n && n.type === 'bar')

  assert.equal(
    childAt(0, isBar)(node),
    node.nodes.get(0),
    'returns the node at index if matcher returns true'
  )

  assert.equal(
    isBar.callCount,
    1,
    'calls matcher exactly once'
  )

  assert.equal(
    childAt(0)(isBar)(node),
    node.nodes.get(0),
    'allows partial application'
  )

  assert.equal(
    childAt(4)(isBar)(node),
    undefined,
    'returns falsy if the index greater than node.nodes.size'
  )

  assert.equal(
    childAt(1)(isBar)(node),
    false,
    'returns falsy if the node at index does not match'
  )
})

test('rules.firstChild', assert => {
  assert.plan(3)

  const isBar = n => n && n.type === 'bar'
  const isBaz = n => n && n.type === 'baz'

  assert.equal(
    firstChild(isBar)(node),
    node.nodes.get(0),
    'returns the first child if it matches'
  )

  assert.equal(
    firstChild(isBaz)(node),
    false,
    'returns false if the first child does not match'
  )

  assert.equal(
    firstChild(isBaz)(Document.create()),
    undefined,
    'returns falsy if the node is empty'
  )
})

test('rules.lastChild', assert => {
  assert.plan(3)

  const isBaz = n => n && n.type === 'baz'
  const isBar = n => n && n.type === 'Bar'

  assert.equal(
    lastChild(isBaz)(node),
    node.nodes.get(2),
    'returns the last child if it matches'
  )

  assert.equal(
    lastChild(isBar)(node),
    false,
    'returns false if the last child does not match'
  )

  assert.equal(
    lastChild(isBar)(Document.create()),
    undefined,
    'returns falsy if the node is empty'
  )
})

test('rules.childrenAfter', assert => {
  assert.plan(3)

  assert.equal(
    List.isList(childrenAfter(1)(node)),
    true,
    'returns a list of all nodes after index'
  )

  assert.equal(
    childrenAfter(1)(node).get(0),
    node.nodes.get(2),
    'the list contains the nodes after index'
  )

  assert.equal(
    childrenAfter(5)(node),
    false,
    'returns false if node.nodes.size < index'
  )
})

test('rules.filter', assert => {
  assert.plan(2)

  assert.equal(
    filter(n => n && n.type === 'baz')(node).size,
    2,
    'returns all children that match the filter'
  )

  assert.equal(
    filter(n => n && n.type === 'foo')(node),
    false,
    'returns falsy if no matching children were found'
  )
})

test('rules.asList', assert => {
  assert.plan(2)

  const value = 'foo'
  const boxedValue = List.of(value)

  assert.equal(
    boxedValue.equals(asList(value)),
    true,
    'returns a boxed value if value is not a List'
  )

  assert.equal(
    asList(boxedValue),
    boxedValue,
    'returns the value if value is a List'
  )
})

test('rules.remove', assert => {
  assert.plan(4)

  const nodeToRemove = firstChild(n => n && n.type === 'bar')(value.document)

  assert.equal(
    remove(value.change(), value.document, nodeToRemove)
      .value.document.nodes.size,
    2,
    'removes a given node from the document'
  )

  assert.equal(
    remove(value.change(), value.document, nodeToRemove)
      .value.document.nodes.get(0),
    value.document.nodes.get(1),
    'removes the correct node'
  )

  const nodesToRemove = childrenAfter(0)(value.document)

  assert.equal(
    remove(value.change(), value.document, nodesToRemove)
      .value.document.nodes.size,
    1,
    'removes a list of nodes from the document'
  )

  assert.equal(
    remove(value.change(), value.document, nodesToRemove)
      .value.document.nodes.get(0),
    value.document.nodes.get(0),
    'removes the right nodes from the document'
  )
})

test('rules.insertAt', assert => {
  assert.plan(4)

  const blockToInsert = Block.create({
    type: 'foobar',
    nodes: [Text.create('')]
  })
  const insertAtSecond = insertAt(1, () => blockToInsert)

  assert.equal(
    insertAtSecond(value.change(), value.document)
      .value.document.nodes.get(1),
    blockToInsert,
    'inserts a new node at index'
  )

  assert.equal(
    insertAtSecond(value.change(), value.document)
      .value.document.nodes.get(2),
    value.document.nodes.get(1),
    'shifts the indexes of all next siblings by 1'
  )

  const blocksToInsert = List.of(
    Block.create({ type: 'typeA' }),
    Block.create({ type: 'typeB' })
  )
  const insertAfterSecond = insertAt(1, () => blocksToInsert)

  assert.equal(
    insertAfterSecond(value.change(), value.document)
      .value.document.nodes.size,
    5,
    'reducers can return a list of nodes to insert'
  )

  const updatedState = insertAfterSecond(value.change(), value.document).value
  const nodeA = updatedState.document.nodes.get(1)
  const nodeB = updatedState.document.nodes.get(2)

  assert.equal(
    (nodeA.type === 'typeA' && nodeB.type === 'typeB'),
    true,
    'a list of nodes gets inserted incrementally'
  )
})

test('rules.prepend', assert => {
  assert.plan(1)

  const blockToInsert = Block.create({
    type: 'foobar',
    nodes: [Text.create('')]
  })
  const reducer = () => blockToInsert

  assert.equal(
    prepend(reducer)(value.change(), value.document)
      .value.document.nodes.get(0),
    insertAt(0, reducer)(value.change(), value.document)
      .value.document.nodes.get(0),
    'is an alias that equals to insertAt(0)'
  )
})

test('rules.append', assert => {
  assert.plan(1)

  const blockToInsert = Block.create({ type: 'foobar' })
  const reducer = () => blockToInsert

  assert.equal(
    append(reducer)(value.change(), value.document)
      .value.document.nodes.get(0),
    insertAt(3, reducer)(value.change(), value.document)
      .value.document.nodes.get(0),
    'decorates insertAt with `node.nodes.size`'
  )
})

test('rules.update', assert => {
  assert.plan(3)

  const nodeToUpdate = value.document.nodes.get(0)

  assert.equal(
    update(() => 'sometype')(value.change(), value.document, nodeToUpdate)
      .value.document.nodes.get(0).type,
    'sometype',
    'updates a given node'
  )

  assert.equal(
    update(() => ({ data: { foo: 'bar' } }))(
      value.change(),
      value.document,
      nodeToUpdate
    ).value.document.nodes.get(0).data.get('foo'),
    'bar',
    'reducers can return anything compatible to slates\'s `Change.setNodeByKey`'
  )

  const nodesToUpdate = childrenAfter(0)(value.document)
  const reducer = () => ({ data: { foo: 'bar' } })
  const updatedState = update(reducer)(value.change(), value.document, nodesToUpdate)
    .value

  const nodeA = updatedState.document.nodes.get(1)
  const nodeB = updatedState.document.nodes.get(2)

  assert.equal(
    nodeA.data.get('foo') === 'bar' && nodeB.data.get('foo') === 'bar',
    true,
    'updates a list of nodes'
  )
})

test('rules.not', assert => {
  assert.plan(1)

  const isBaz = n => n && n.type === 'baz'

  assert.equal(
    firstChild(
      not(isBaz)
    )(node),
    node.nodes.get(0),
    'inverts the result of a matcher'
  )

  assert.end()
})

test('rules.unwrap', assert => {
  assert.plan(1)

  const wrappedState = value
    .change()
    .wrapBlockByKey(value.document.nodes.get(0).key, 'typeA')
    .value

  const unwrappedState = unwrap(() => 'unwrapped')(
    wrappedState.change(),
    wrappedState.document.nodes.get(0),
    wrappedState.document.nodes.get(0).nodes.get(0)
  ).value

  assert.equal(
    unwrappedState.document.nodes.get(0).type,
    'unwrapped',
    'unwraps all results'
  )
})
