- [Introduction](#introduction)
- [Guides](#guides)
  - [Adding New Elements](#adding-new-elements)
  - [Adding New Marks](#adding-new-marks)
- [Concepts](#concepts)
  - [Insertion](#insertion)
  - [Normalisation](#normalisation)
  - [Nodes Data](#nodes-data)
  - [Toolbars](#toolbars)
  - [Placeholders](#placeholders)
  - [Character Count](#character-count)
- [Config Options](#config-options)


## Introduction

This editor sits on top of [SlateJS](https://docs.slatejs.org/). It provides the authorship of [Republik](https://www.republik.ch) with a tool that integrates into one's daily flow and allows to compose quick, of-the-moment, structured content.

Our ambition is to write scalable code, and make it easy for the new dev on the team to extend the editor with another element. Everything that's touching Slate is tucked away in the `/editor` folder. This includes decorators, UI elements, and the handful of abstractions we describe in the [concepts](#concepts) section. The rest comes down to configuration. The [guide section](#guides) walks you through ~~a crazy few days in the life of Anna from IT~~ a few examples. If a comprehensive overview of the configuration options is what you are after, [we've got you covered](#config-options) too.

You don't need any Slate literacy to go through the [guides](#guides), but a working understanding of the framework may prove useful to those curious souls who wish to [dive further](#concepts).

## Guides

### Adding New Elements

*Monday:* Oli corners you in front of the coffee machine, and he really, really wants a carousel, because he thinks carousels are very cool. And indeed, you are getting chills, mostly because you know that carousels are tricky beasts. Can you throw a draft together before you've got to pick your kid at 6pm?

We begin by creating a `/carousel` subfolder in the `/elements` folder. This is where the configuration for Slate `elements` lives.

> `elements` are the building blocks of Slate. They always have a `type` and are rendered as blocks (divs) unless otherwise specified. The other type of custom nodes are `marks`. As the name suggests, marks are annotations to text leaves, for instance **bold**.

#### Specify a Complex Structure

Now that our carousel has a home, let's create a `carouselContainer` element. This consists in 2 steps:

1. Extend the type system to accommodate our new element and keep the compiler happy.
2. Write a config for the element.

For 1. we open `custom-types.d`, in the root folder. This file contains the type declaration of the editor.

1. a) We add the new element type:

```code|lang-js
export type CarouselContainerElement = SharedElement & {
  type: 'carouselContainer'
}
```

1. b) We extend `CustomElement` and `CustomElementType`:

```code|lang-js
export type CustomElement =
  | HeadlineElement
  | ParagraphElement
  ...
  | CarouselContainerElement

export type CustomElementsType =
  | 'headline'
  | 'paragraph'
  ...
  | 'carouselContainer'
```
*Yes, there is some duplication. No, there is no way around that.*

For 2. we go back to our `/carousel` config folder. Let's specify the required configuration in `carousel/container.tsx`. No, this file doesn't exist yet. Yes, you should go ahead and create it. Here is what to put in it:

```code|lang-js
import { ElementConfigI } from '../../custom-types'
import { ContainerComponent } from '../../editor/Element'

export const config: ElementConfigI = {
  Component: ContainerComponent,
  structure: [
    { type: 'carouselTitle' },
    { 
    	type: 'figure', 
    	repeat: true
    }
  ]
}
```

Let's parse this, shall we?

`Component` defines the React component represented by the `CarouselContainer` element. It is often an element from the [Republik Styleguide](https://styleguide.republik.ch/). Here though, `ContainerComponent` is a Slate-compliant div that serves as configuration vessel.

> Slate has a [handful of requirements](https://docs.slatejs.org/walkthroughs/03-defining-custom-elements) for React components:
>
> - the top-level node needs the `attributes`
> - `children` are rendered as the last node
> - elements which are not part of the slate tree should be marked with `style={{ userSelect: 'none' }}` or `contentEditable={false}`

The `structure` array tells us that `carouselContainer` consists of a `carouselTitle` and multiple `figures`. If this isn't true, new nodes will be automatically inserted and/or deleted during the normalisation cycle of Slate, until our `carousel` complies with the structure.

> Structures work recursively. For instance, `figure` requires a `figureImage` and a `figureCaption`.

Very good. Now we need to define what `carouselTitle`does.

#### Import a Styleguide Compoment

From the top: we open `custom-types.d` and extend the types for `carouselTitle`:

```code|lang-js
export type CarouselTitleElement = SharedElement & {
  type: 'carouselTitle'
}

export type CustomElement =
  | HeadlineElement
  ...
  | CarouselContainerElement
  | CarouselTitleElement

export type CustomElementsType =
  | 'headline'
  ...
  | 'carouselContainer'
  | 'carouselTitle'
```

Then we configure our element. Let's say we want the title of the carousel to look like an editorial subhead. `/carousel/title.tsx`:

```code|lang-js
import { ElementConfigI } from '../../custom-types'
import { Editorial } from '@project-r/styleguide'

export const config: ElementConfigI = {
  Component: Editorial.Subhead
}
```

#### Handle Custom Data

"Hey, but what if a component requires additional data?" you may ask. Good question.

This is `figureImage`. Without its `src` attribute, `figureImage` is nothing.

It's in the type definition:

```code|lang-js
export type FigureImageElement = SharedElement & {
  type: 'figureImage'
  src?: string
}
```

And it's in the config, too:

```code|lang-js
const Component: React.FC<{
  element: FigureImageElement
  [x: string]: unknown
}> = ({ children, element, ...props }) => (
  <div {...props}>
    <div style={{ userSelect: 'none' }} contentEditable={false}>
      <FigureImage
        {...{ src: element.src || '/static/placeholder.png', ...element }}
      />
    </div>
    {children}
  </div>
)

const Form: React.FC<ElementFormProps<FigureImageElement>> = ({
  element,
  onChange
}) => (
  <>
    <div>
      <Label>Light mode</Label>
      <ImageInput
        src={element.src}
        onChange={src => {
          onChange({ src })
        }}
      />
    </div>
    <div>
      <Label>Dark mode (optional)</Label>
      <ImageInput
        src={element.srcDark}
        onChange={srcDark => {
          onChange({ srcDark })
        }}
      />
    </div>
  </>
)

export const config: ElementConfigI = {
  Component,
  Form,
  attrs: {
    isVoid: true,
    editUi: true,
    propagateDelete: true
  }
}
```

In order to edit a node's custom data, we define a `Form` property in the config. Then, when someone double clicks on the element, the editor loads the form in an overlay. Parent elements' forms are pulled out and displayed as well.

#### Putting Things Together

Last but not least, we import the configs into `/elements/index.tsx`:

```code|lang-js
...
import { config as carouselContainer } from './carousel/container'
import { config as carouselTitle } from './carousel/container'

export const config: ElementsConfig = {
  paragraph,
  headline,
  link,
  ...
  carouselContainer,
  carouselTitle
}
```

> The key name should to match the type name of the element.

Take that, Oli. Granted, an unstyled div isn't much of a carousel, but you didn't expect me to do ALL your work for you, did you? Go scour the Internet if [the one from the Styleguide](https://styleguide.republik.ch/teasercarousel) isn't good enough for you.

### Adding New Marks

*Tuesday:* After the smashing success of yesterday, Katharina comes to find you in your fancy office. (You are a very important member of the organisation and your office is super glossy.) Katharina does marketing and she always erupts with crazy ideas, so you are getting nervous. Turns out she read this guide and ~~would like~~ **needs** the strikethrough effect for this winter's promotional campaign. You aren't fully convinced. "Isn't it going to be a bit much?" you think. But then again, no one pays you to think, right?

Lucky for you, this one's easy. Marks generally are. You open `custom-types.d.ts` and extend the `CustomMarks` type:

```code|lang-js
type CustomMarks = {
  ...
  sup?: boolean
  strikethrough?: boolean
}
```

You add a `strikethrough.tsx` config file in `/marks`:

```code|lang-js
import { NodeConfigI } from '../custom-types'
import { MdStrikethroughS } from '@react-icons/all-files/md/MdStrikethroughS'

export const config: MarkConfigI = {
  styles: css({ textDecoration: 'line-through' }),
  button: {
  	toolbar: 'hovering'
  }
}
```

The `button` configuration works for marks and elements alike. Marks buttons show up in a hovering toolbar whenever some text is selected.

The `styles` attribute refers to a piece of glamor CSS. The styles of the different marks are aggregated and rendered together in the leaf component.

As a last step you include this config into `marks/index.tsx`, before getting back to Katharina with the satisfaction of a job well done:

```code|lang-js
import { config as strikethrough } from './strikethrough'

export const config: MarksConfig = {
  italic,
  bold,
  sup,
  sub,
  strikethrough
}
```

### Next steps

The ~~week~~ journey is far from over but this is as far as this guide goes for now. Stay tuned for updates.

## Concepts

### Insert Element

There are three ways a new element can be inserted into the Slate tree.

1. On enter
2. Keyboard shortcuts
3. Normalisation (which has a chapter of its own below)

#### On Enter

We check the structure to see if it allows for any insert. If it does, the first matching element is inserted. If it doesn't, we navigate to the next element (as would happen on Tab).

> First matching element = closest repeatable element forward in the Slate tree **and** first element in the template type array. For instance if our structure specifies the following types: `['paragraph', 'figure', 'pullQuote']`, the Enter key will trigger the insertion of a new paragraph, even if the cursor is in a figure or a quote.

#### Keyboard Shortcuts

`insertOnKey` triggers the insertion of a specific element on a special key combo.

For instance, `Enter+shift` inserts a `break` element:

```code|lang-js
<Editable
  renderElement={renderElement}
  renderLeaf={renderLeaf}
  onKeyDown={event => {
    insertOnKey({ name: 'Enter', shift: true }, 'break')(editor, event)
    handleInsert(editor, event)
    navigateOnTab(editor, event)
  }}
/>
```

> If the chosen element is not allowed in the structure, it gets deleted by the normalisation.

### Normalisation

Every time the value of the document changes (in plain text: every time someone edits something), Slate runs a normalisation cycle, where it checks that the document is still valid and fixes any problem.

While Slate also has [its own agenda](https://docs.slatejs.org/concepts/11-normalizing#built-in-constraints), normalisations can be extended ad lib. Which we did.

#### Fix Structure

This is the most complex piece of custom normalisation in the project. Given a Slate node, we check that it conforms to the specified `structure` and iteratively fix the problems.

> Everytime one problem is fixed, the normalisation function returns, and runs again. This prevents issues such as: a node is deleted, but a subsequent normaliser hasn't gotten the memo and tries to access it.

The normalisation reruns until the Slate tree is stable, meaning that if a new element is inserted, it will move along the descendants automatically. So the structure only has to worry about first-level descendants. Example:

```code|lang-js
export const config: ElementConfigI = {
  Component,
  Form,
  structure: [{ type: 'figureImage' }, { type: 'figureCaption' }],
  button: { icon: ImageIcon }
}
```

`figureCaption` has its own structure requirements, but we don't care about this here. It will enjoy its own rounds of structure fixing.

Conversely, if an element config doesn't specify a structure, we default to:

```code|lang-js
const DEFAULT_STRUCTURE = [{ type: ['text'], repeat: true }]
```

#### Structure Array

A `structure` is an array of `NodeTemplate`. Each `NodeTemplate` specifies the type of the element (single element or an array of them) and whether the element is unique or can be repeated.

`figureCaption` is a good example:

```code|lang-js
export const config: ElementConfigI = {
  Component: FigureCaption,
  structure: [
    { type: ['text', 'link'], repeat: true },
    { type: 'figureByline' },
    { type: 'text', end: true }
  ],
  attrs: {
    formatText: true
  }
}
```

Structures cannot be ambiguous. The following structure will cause problems:

```code|lang-js
structure: [
  { type: ['text', 'link'], repeat: true },
  { type: 'link' },
  { type: 'text', end: true }
]
```

### End Nodes

One of Slate's [built-in constraints](https://docs.slatejs.org/concepts/11-normalizing#built-in-constraints) is that inline nodes cannot be the first or last nodes of a parent block.

This is annoying. See once more `FigureCaption`, where `FigureByline` should be the last element:

```code|lang-js
export const config: ElementConfigI = {
  Component: FigureCaption,
  structure: [
    { type: ['text', 'link'], repeat: true },
    { type: 'figureByline' },
    { type: 'text', end: true }
  ],
  attrs: {
    formatText: true
  }
}
```

We solve the problem by adding an attribute called `end` to text nodes. End nodes are at either end of the structure and do not contain any text. If someone starts writing inside an end node, the text gets reallocated to the nearest non-end node in the next normalisation cycle.

#### Custom Normalisers

Some elements need custom normalisation. This is achieved by passing an array of normalisers in the config. This one, for instance, remove any link where the node has no text:

```code|lang-js
const unlinkWhenEmpty: NormalizeFn<LinkElement> = ([node, path], editor) => {
  if (!node.href && Editor.string(editor, path) === '') {
    Transforms.unwrapNodes(editor, { at: path })
    return true
  }
  return false
}
```

> A conform normaliser should break and return `true` when it changes something to the Slate tree, `false` otherwise. For instance, we want to unlink any link  will remove any empty link:

### Forms

Declaring a `Form` in the config provides an interface to edit a node's data.

For example, here is the form for uploading an image:

```code|lang-js
const Form: React.FC<ElementFormProps<FigureImageElement>> = ({
  element,
  onChange
}) => (
<div>
  <Label>Light mode</Label>
  <ImageInput
    src={element.src}
    onChange={src => {
      onChange({ src })
    }}
  />
</div>
)
```

TBC


### Toolbar

Any element/mark that defines a `button` in the config can be rendered in either the `fixed` or the `hovering` toolbar.

#### Marks

#### Inlines

#### Blocks





### Placeholders

The `LeafComponent` renders text nodes and adds placeholder text when no actual text is present. The placeholder text is determined by the type of the parent element (e.g. `title` or `paragraph`).

```code|lang-js
export const LeafComponent: React.FC<{
  attributes: Attributes
  children: ReactElement
  leaf: CustomText
}> = ({ attributes, children, leaf }) => {
  configKeys
    .filter(mKey => leaf[mKey])
    .forEach(mKey => {
      const Component = config[mKey].Component
      children = <Component>{children}</Component>
    })
  return (
    <span {...attributes} style={{ position: 'relative' }}>
      {!leaf.text && (
        <Placeholder leaf={leaf} element={children.props.parent} />
      )}
      {children}
    </span>
  )
}
```

*To be implemented:* Better placeholder text // disable feature.

### Character Count

The last important feature of something named "kurzformat" is the length – or rather, the shortness – for which we use the `withCharLimit` decorator.

This decorator intercepts Slate's `insertText`, `insertFragment` and `insertNode` and triggers an early return wheneverr the aggregate of all text in the editor is more than the number of `maxSigns` specified in the editor config (currently 3000).

## Config Options

### Mark/Element Config

Name | Description
:--- | ---:
Component | Slate compliant React component
button | *see above*

#### `button`

Name | Description
:--- | ---:
icon | React icon
small | boolean

### Element-specific Config

Name | Description
:--- | ---:
insert | function
node | Slate node
DataForm | data form
needsData | array of node keys
normalizations | array of normalisers
placeholder | string
structure | array of `structure elements`
attrs | *see below*

#### `structure element`

Name | Description
:--- | ---:
type | custom element type (e.g. `figure`) or array of types
repeat | array of min and max repeats

#### `attrs`

Name | Description
:--- | ---:
isVoid | boolean
isInline | boolean
editUi | boolean
formatText | boolean

### Editor Config

Name | Description
:--- | ---:
maxSigns | number
