const jsYaml = require('js-yaml')

module.exports.parse = () => {
  const transform = (parent) => {
    if (parent.type !== 'root') {
      return
    }

    const yamlNode = parent.children.find(node => node.type === 'yaml')

    let meta = {}
    if (yamlNode) {
      meta = jsYaml.safeLoad(yamlNode.value)
      parent.children = parent.children.filter(node => node !== yamlNode)
    }
    parent.meta = meta
  }

  return transform
}

module.exports.format = () => {
  const transform = (parent) => {
    if (parent.type !== 'root') {
      return
    }

    if (Object.keys(parent.meta).length) {
      parent.children.unshift({
        type: 'yaml',
        value: jsYaml.safeDump(parent.meta || {}).trim()
      })
    }
  }

  return transform
}
