import HTML5Backend from 'react-dnd-html5-backend'

export default () => {
  let dropHandler
  const ReactDnDPlugin = {
    onDrop (event) {
      dropHandler(event)
    }
  }

  const SlateHTML5Backend = (...args) => {
    const backend = new HTML5Backend(...args)
    dropHandler = backend.handleTopDrop
    return backend
  }

  return {
    SlateHTML5Backend,
    ReactDnDPlugin
  }
}
