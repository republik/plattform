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
      const state = backend.monitor.store.getState()
      if (state.dragOperation.targetIds.length > 0) {
        backend.handleTopDrop(event)
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
