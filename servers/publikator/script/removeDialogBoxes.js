#!/usr/bin/env node
/**
 * This script removes the dialog-boxes
 * "Dialog mit der Redaktion" and "Feedback ans Feulleton"
 * from existing published articles.
 *
 * Usage: (run from servers/publikator)
 * node script/removeDialogBoxes.js [-n [num]] [--dry]
 * -n: stop after n fixes
 * -- dry: don't commit/publish
 */

const transformPublications = require('./lib/transformPublications')
const visit = require('unist-util-visit')

const removeDialogBox = ({ content: mdast }) => {
  let removedTitle
  visit(mdast, 'zone', (node, i, parent) => {
    let title
    if (
      node.identifier === 'INFOBOX' &&
      node.children.find(child =>
        child.type === 'heading' &&
        child.children.find(child2 =>
          (
            child2.value === 'Dialog mit der Redaktion' ||
            child2.value === 'Feedback ans Feuilleton'
          ) && (title = child2.value)
        )
      )
    ) {
      parent.children.splice(i, 1)
      removedTitle = title
    }
  })
  return removedTitle
    ? `entfernt: ${removedTitle}`
    : null
}

transformPublications({
  transform: removeDialogBox
})
