import { Record, List } from 'immutable'
import { Block, Text, Value, Document } from 'slate'
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
  unwrap,
} from './rules'

const node = Document.create({
  nodes: [
    Block.create({
      kind: 'block',
      type: 'bar',
      nodes: [Text.create('Bar')],
    }),
    Block.create({
      kind: 'block',
      type: 'baz',
      nodes: [Text.create('Baz')],
    }),
    Block.create({
      kind: 'block',
      type: 'baz',
      nodes: [Text.create('Baz 2')],
    }),
  ],
})

const value = Value.create({
  document: node,
})

describe('editor rules test-suite', () => {
  it('rules.rule', () => {
    // returns an object with its keys set to the passed arguments
    expect(rule('one', 'two', 'three')).toStrictEqual({
      match: 'one',
      validate: 'two',
      normalize: 'three',
    })

    // is a curried function
    expect(rule('one')('two')('three')).toStrictEqual({
      match: 'one',
      validate: 'two',
      normalize: 'three',
    })
  })

  it('rules.isNone', () => {
    expect(isNone(node.nodes.get(4))).toBeTruthy()
  })

  it('rules.isEmpty', () => {
    const emptyNode = Record({
      nodes: List(),
    })()

    // returns the passed node if it is empty
    expect(isEmpty(emptyNode)).toBe(emptyNode)

    const nonEmptyNode = Record({
      nodes: List([1]),
    })()

    // returns false if the passed node is not empty
    expect(isEmpty(nonEmptyNode)).toBeFalsy()
  })

  it('rules.childAt', () => {
    const isBar = jest.fn((n) => n && n.type === 'bar')

    // returns the node at index if matcher returns true
    expect(childAt(0, isBar)(node)).toBe(node.nodes.get(0))

    // calls matcher exactly once
    expect(isBar).toHaveBeenCalledTimes(1)

    // allows partial application
    expect(childAt(0)(isBar)(node)).toBe(node.nodes.get(0))

    // returns falsy if the index greater than node.nodes.size
    expect(childAt(4)(isBar)(node)).toBeUndefined()

    // returns falsy if the node at index does not match
    expect(childAt(1)(isBar)(node)).toBeFalsy()
  })

  it('rules.firstChild', () => {
    const isBar = (n) => n && n.type === 'bar'
    const isBaz = (n) => n && n.type === 'baz'

    // returns the first child if it matches
    expect(firstChild(isBar)(node)).toBe(node.nodes.get(0))

    // returns false if the first child does not match
    expect(firstChild(isBaz)(node)).toBeFalsy()

    // returns falsy if the node is empty
    expect(firstChild(isBaz)(Document.create())).toBeUndefined()
  })

  it('rules.lastChild', () => {
    const isBaz = (n) => n && n.type === 'baz'
    const isBar = (n) => n && n.type === 'Bar'

    // returns the last child if it matches
    expect(lastChild(isBaz)(node)).toBe(node.nodes.get(2))

    // returns false if the last child does not match
    expect(lastChild(isBar)(node)).toBeFalsy()

    // returns falsy if the node is empty
    expect(lastChild(isBar)(Document.create())).toBeUndefined()
  })

  it('rules.childrenAfter', () => {
    // returns a list of all nodes after index
    expect(List.isList(childrenAfter(1)(node))).toBeTruthy()

    // the list contains the nodes after index
    expect(childrenAfter(1)(node).get(0)).toBe(node.nodes.get(2))

    // returns false if node.nodes.size < index
    expect(childrenAfter(5)(node)).toBeFalsy()
  })

  it('rules.filter', () => {
    // returns all children that match the filter
    expect(filter((n) => n && n.type === 'baz')(node).size).toBe(2)

    // returns falsy if no matching children were found
    expect(filter((n) => n && n.type === 'foo')(node)).toBeFalsy()
  })

  it('rules.asList', () => {
    const value = 'foo'
    const boxedValue = List.of(value)

    // returns a boxed value if value is not a List
    expect(boxedValue.equals(asList(value))).toBeTruthy()

    // returns the value if value is a List
    expect(asList(boxedValue)).toBe(boxedValue)
  })

  it('rules.remove', () => {
    const nodeToRemove = firstChild((n) => n && n.type === 'bar')(
      value.document,
    )

    // removes a given node from the document
    expect(
      remove(value.change(), value.document, nodeToRemove).value.document.nodes
        .size,
    ).toBe(2)

    // removes the correct node
    expect(
      remove(
        value.change(),
        value.document,
        nodeToRemove,
      ).value.document.nodes.get(0),
    ).toBe(value.document.nodes.get(1))

    const nodesToRemove = childrenAfter(0)(value.document)

    // removes a list of nodes from the document
    expect(
      remove(value.change(), value.document, nodesToRemove).value.document.nodes
        .size,
    ).toBe(1)

    // removes the right nodes from the document
    expect(
      remove(
        value.change(),
        value.document,
        nodesToRemove,
      ).value.document.nodes.get(0),
    ).toBe(value.document.nodes.get(0))
  })

  it('rules.insertAt', () => {
    const blockToInsert = Block.create({
      type: 'foobar',
      nodes: [Text.create('')],
    })
    const insertAtSecond = insertAt(1, () => blockToInsert)

    // inserts a new node at index
    expect(
      insertAtSecond(value.change(), value.document).value.document.nodes.get(
        1,
      ),
    ).toBe(blockToInsert)

    // shifts the indexes of all next siblings by 1
    expect(
      insertAtSecond(value.change(), value.document).value.document.nodes.get(
        2,
      ),
    ).toBe(value.document.nodes.get(1))

    const blocksToInsert = List.of(
      Block.create({ type: 'typeA' }),
      Block.create({ type: 'typeB' }),
    )
    const insertAfterSecond = insertAt(1, () => blocksToInsert)

    // reducers can return a list of nodes to insert
    expect(
      insertAfterSecond(value.change(), value.document).value.document.nodes
        .size,
    ).toBe(5)

    const updatedState = insertAfterSecond(value.change(), value.document).value
    const nodeA = updatedState.document.nodes.get(1)
    const nodeB = updatedState.document.nodes.get(2)

    // a list of nodes gets inserted incrementally
    expect(nodeA.type === 'typeA' && nodeB.type === 'typeB').toBeTruthy()
  })

  it('rules.prepend', () => {
    const blockToInsert = Block.create({
      type: 'foobar',
      nodes: [Text.create('')],
    })
    const reducer = () => blockToInsert

    // is an alias that equals to insertAt(0)
    expect(
      prepend(reducer)(value.change(), value.document).value.document.nodes.get(
        0,
      ),
    ).toBe(
      insertAt(0, reducer)(
        value.change(),
        value.document,
      ).value.document.nodes.get(0),
    )
  })

  it('rules.append', () => {
    const blockToInsert = Block.create({ type: 'foobar' })
    const reducer = () => blockToInsert

    // decorates insertAt with `node.nodes.size`
    expect(
      append(reducer)(value.change(), value.document).value.document.nodes.get(
        0,
      ),
    ).toBe(
      insertAt(3, reducer)(
        value.change(),
        value.document,
      ).value.document.nodes.get(0),
    )
  })

  it('rules.update', () => {
    const nodeToUpdate = value.document.nodes.get(0)

    // updates a given node
    expect(
      update(() => 'sometype')(
        value.change(),
        value.document,
        nodeToUpdate,
      ).value.document.nodes.get(0).type,
    ).toBe('sometype')

    // reducers can return anything compatible to slates's `Change.setNodeByKey`
    expect(
      update(() => ({ data: { foo: 'bar' } }))(
        value.change(),
        value.document,
        nodeToUpdate,
      )
        .value.document.nodes.get(0)
        .data.get('foo'),
    ).toBe('bar')

    const nodesToUpdate = childrenAfter(0)(value.document)
    const reducer = () => ({ data: { foo: 'bar' } })
    const updatedState = update(reducer)(
      value.change(),
      value.document,
      nodesToUpdate,
    ).value

    const nodeA = updatedState.document.nodes.get(1)
    const nodeB = updatedState.document.nodes.get(2)

    // updates a list of nodes
    expect(
      nodeA.data.get('foo') === 'bar' && nodeB.data.get('foo') === 'bar',
    ).toBeTruthy()
  })

  it('rules.not', () => {
    const isBaz = (n) => n && n.type === 'baz'

    // inverts the result of a matcher
    expect(firstChild(not(isBaz))(node)).toBe(node.nodes.get(0))
  })

  it('rules.unwrap', () => {
    const wrappedState = value
      .change()
      .wrapBlockByKey(value.document.nodes.get(0).key, 'typeA').value

    const unwrappedState = unwrap(() => 'unwrapped')(
      wrappedState.change(),
      wrappedState.document.nodes.get(0),
      wrappedState.document.nodes.get(0).nodes.get(0),
    ).value

    // unwraps all results
    expect(unwrappedState.document.nodes.get(0).type).toBe('unwrapped')
  })
})
