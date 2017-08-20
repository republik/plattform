const Immutable = require('immutable')
const TreeUtils = require('immutable-treeutils')

module.exports = {
  meta: async (doc, args) => {
    const treeUtils = new TreeUtils(
      Immutable.Seq.of(),
      'id',
      'nodes'
    )
    const documentTree = Immutable.fromJS(JSON.parse(doc.content))
    const headerNodes = treeUtils.find(
      documentTree,
      node => node.get('type') === 'H1'
    )

    if (!headerNodes) {
      return {title: 'empty'}
    }

    const title = documentTree
      .getIn(headerNodes)
      .get('nodes')
      .first()
      .get('text')

    return {
      title
    }
  }
}
