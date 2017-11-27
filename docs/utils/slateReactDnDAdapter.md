# `slateReactDnDAdapter`

This is a small hack to allow interoperability between Slate and [react-dnd](http://react-dnd.github.io/react-dnd/), a library that lets you write well-defined Drag'n'Drop behavior.

## Usage

Import and call the factory function and extract the generated Slate plugin and `react-dnd` backend from it.

```
import slateReactDnDAdapter from 'components/editor/utils/slateReactDnDAdapter'

const {
  SlateHTML5Backend,
  ReactDnDPlugin
}  = slateReactDnDAdapter()
```

When rendering your Slate `<Editor />`, just wrap it with a `react-dnd` context provider ([`DragDropContextProvider`](http://react-dnd.github.io/react-dnd/docs-drag-drop-context-provider.html) or [`DragDropContext`](http://react-dnd.github.io/react-dnd/docs-drag-drop-context.html)) and pass it the generated backend. In order for `react-dnd` to work properly you'll have to pass it the generated Slate plugin as well.

```
import { DragDropContextProvider } from 'react-dnd';
import { Editor } from 'slate-react'

const myPlugins = [
  //...some plugins
  ReactDnDPlugin
]

const MyEditor = () => (
  <DragDropContextProvider backend={SlateHTML5Backend}>
    <Editor plugins={myPlugins} />
  </DragDropContextProvider>
)
```

After that, you're able to use `react-dnd` [just like you'd expect](http://react-dnd.github.io/react-dnd/docs-overview.html).

## Why is this necessary?

As of now, Slate imperatively prevents both the default behavior and the propagation of drop events on the entirety of its scope ([Source](https://github.com/ianstormtaylor/slate/blob/master/packages/slate-react/src/plugins/before.js#L306-L317)). [It doesn't care so much about the rest of the HTML5 Drag'n'Drop spec](https://github.com/ianstormtaylor/slate/pull/1278), but because drop events generally imply some kind of mutation, they have to be somewhat contained. Slate offers customizable behavior [through its plugin API](https://docs.slatejs.org/slate-react/plugins#ondrop) (where `onDrop` is also the only representative of the usual Drag'n'Drop suspects), but it won't propagate sh*t unless you somehow tell it to do so.

`react-dnd` on the other hand, or more precisely, the [`react-dnd-html5-backend`](http://react-dnd.github.io/react-dnd/docs-html5-backend.html) obviously relies heavily on drop events, both during capturing and bubbling phase.

So I had to somewhat delegate the Slate drop behavior to `react-dnd` and this is what this hack does.

## What if I want my plugins to handle drop events without or despite `react-dnd`?

As with all Slate plugins, order matters. The generated plugin will never abort plugin stack processing (aka returning truthy), but by having it at the bottom of your plugin array, you'd be able to override delegation to `react-dnd` by simply returning a truthy value after your operation. In our editor, the generated adapter plugin always comes last, so you could just

```
const myPlugin = {
  onDrop(event) {
    // do your drop
    return true
  }
}
```
... and `react-dnd` wouldn't even know that a drop event occurred.
