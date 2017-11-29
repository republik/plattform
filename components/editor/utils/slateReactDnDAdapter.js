import HTML5Backend from 'react-dnd-html5-backend'

export default () => {
  let dropHandler
  const ReactDnDPlugin = {
    onDrop (event, change, editor) {
      return dropHandler(event, change, editor)
    }
  }

  const SlateHTML5Backend = (...args) => {
    const backend = new HTML5Backend(...args)
    dropHandler = (event, change, editor) => {
      const before = backend.monitor.store.getState()
      backend.handleTopDrop(event)
      const after = backend.monitor.store.getState()
      if (before.dragOperation.targetIds.length !== after.dragOperation.targetIds.length) {
        return true
      }
    }

    return backend
  }

  return {
    SlateHTML5Backend,
    ReactDnDPlugin
  }
}
