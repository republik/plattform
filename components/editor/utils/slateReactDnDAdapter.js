import HTML5Backend from 'react-dnd-html5-backend'

let dropHandler
const ReactDnDPlugin = {
  onDrop (event, change, editor) {
    if (dropHandler) {
      dropHandler(event)
      return true
    }
  }
}

const SlateHTML5Backend = (...args) => {
  const backend = new HTML5Backend(...args)
  dropHandler = (event) => {
    backend.handleTopDrop(event)
  }

  return backend
}

export default () => {
  return {
    SlateHTML5Backend,
    ReactDnDPlugin
  }
}
