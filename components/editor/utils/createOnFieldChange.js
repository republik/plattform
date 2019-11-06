import { curry } from 'ramda'

export default curry(
  (onChange, value, node, key, event, fieldValue) => {
    onChange(
      value
        .change()
        .setNodeByKey(node.key, {
          data: fieldValue || fieldValue === false
            ? node.data.set(key, fieldValue)
            : node.data.remove(key)
        })
    )
  }
)
