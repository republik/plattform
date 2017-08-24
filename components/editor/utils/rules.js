import { curry, complement, both, either, isNil } from 'ramda'
import { List } from 'immutable'

export const rule = curry(
  (match, validate, normalize) => ({
    match,
    validate,
    normalize
  })
)

/*
  Matchers
 */
export {
   both,
   either
 }

export const not = complement

export const isNone = isNil

/*
  Validators
 */

export const isEmpty = node =>
   node.nodes.size < 1 && node

const ifExistsAndMatches = (match, result) => result && match(result) && result

const ifNotEmpty = result => !result.isEmpty() && result

export const childAt = curry(
  (index, match) =>
    node =>
      ifExistsAndMatches(
        match,
        node.nodes.get(index)
      )
)

export const firstChild = match =>
  node => ifExistsAndMatches(
    match,
    node.nodes.first()
  )

export const lastChild = match =>
  node => ifExistsAndMatches(
    match,
    node.nodes.last()
  )

export const childrenAfter =
  index =>
    node => ifNotEmpty(
      node.nodes.skip(index + 1)
    )

export const filter =
  fn =>
    node => ifNotEmpty(
      node.nodes.filter(fn)
    )

/*
  Normalizers
 */

export const asList = value =>
  (List.isList(value) && value) || List.of(value)

export const insertAt = curry(
  (index, reducer) =>
    (transform, node, invalidNode) =>
      asList(
        reducer(node, invalidNode)
      )
      .reduceRight(
        (t, nodeToInsert) =>
          t.insertNodeByKey(
            node.key,
            index,
            nodeToInsert
          ),
        transform
      )
)

export const prepend = insertAt(0)

export const append = reducer =>
  (transform, node, invalidNode) =>
    insertAt(node.nodes.size, reducer)(transform, node, invalidNode)

export const update = reducer =>
  (transform, node, result) =>
    asList(result)
      .reduce(
        (t, invalidChild) =>
          t.setNodeByKey(
            invalidChild.key,
            reducer(node, invalidChild)
          ),
        transform
      )

export const remove = (transform, node, result) =>
  asList(result)
    .reduce(
      (t, invalidChild) =>
        t.removeNodeByKey(
          invalidChild.key
        ),
      transform
    )
