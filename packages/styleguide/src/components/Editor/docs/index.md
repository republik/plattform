- [Introduction](#introduction)
- [Guides](#guides)
  - [Adding New Elements](#adding-new-elements)
    - [Basics](#basics)
      - [1. Type System Extension](#1-type-system-extension)
      - [2. Element Config](#2-element-config)
      - [3. Rendering Schema](#3-rendering-schema)
    - [Import a Styleguide Component](#import-a-styleguide-component)
    - [Handle Custom Data](#handle-custom-data)
    - [Putting Things Together](#putting-things-together)
  - [Adding New Marks](#adding-new-marks)
- [Concepts](#concepts)
  - [Editor config](#editor-config)
    - [schema config](#schema-config)
  - [Slate Node config](#slate-node-config)
    - [Element config](#element-config)
      - [ExtendedElementType](#extendedelementtype)
      - [attrs config](#attrs-config)
      - [NodeTemplate](#nodetemplate)
      - [button config](#button-config)
    - [Mark Config](#mark-config)
  - [Structure](#structure)
  - [Custom Data and Forms](#custom-data-and-forms)
  - [Insert Element](#insert-element)
    - [On Enter](#on-enter)
    - [Keyboard Shortcuts](#keyboard-shortcuts)
  - [Normalisation](#normalisation)
    - [Fix Structure](#fix-structure)
    - [End Nodes](#end-nodes)
    - [Main Nodes](#main-nodes)
    - [Linking](#linking)
    - [Custom Normalisers](#custom-normalisers)
  - [Toolbar](#toolbar)
  - [Placeholders](#placeholders)
  - [Character Count](#character-count)


## Introduction

This editor sits on top of [SlateJS](https://docs.slatejs.org/). It provides the authorship of [Republik](https://www.republik.ch) with a tool that integrates into one's daily flow and allows to compose quick, of-the-moment, structured content.

Our ambition is to write scalable code, and make it easy for the new dev on the team to extend the editor with another element. Everything that's touching Slate is tucked away in the `/editor` folder. This includes decorators, UI elements, and the handful of abstractions we describe in the [concepts](#concepts) section. The rest comes down to configuration. The [guide section](#guides) walks you through ~~a crazy few days in the life of Anna from IT~~ a few examples. If a comprehensive overview of the configuration options is what you are after, [we've got you covered](#config-options) too.

You don't need any Slate literacy to go through the [guides](#guides), but a working understanding of the framework may prove useful to those curious souls who wish to [dive further](#concepts).

## Guides

### Adding New Elements

*Monday:* Oli corners you in front of the coffee machine, and he really, really wants a carousel, because he thinks carousels are very cool. And indeed, you are getting chills, mostly because you know that carousels are tricky beasts. Can you throw a draft together before you've got to pick your kid at 6pm?

#### Basics

Let's make Oli happy and create a `carousel` element. This consists in 3 steps:

1. Extend the type system to accommodate our new element and keep the compiler happy.
2. Write a config for the element.
3. Specify a render component in the schema.

##### 1. Type System Extension

We open `custom-types.d`, in the root folder. This file contains the type declaration of the editor.

a) We add the new element type:

```code|lang-js
export type CarouselContainerElement = SharedElement & {
  type: 'carousel'
}
```

b) We extend `CustomElement` and `CustomElementType`:

```code|lang-js
export type CustomElement =
  | HeadlineElement
  | ParagraphElement
  ...
  | CarouselElement

export type CustomElementsType =
  | 'headline'
  | 'paragraph'
  ...
  | 'carousel'
```
*Yes, there is some duplication. No, there is no way around that. Typescript is a bit lame.*

##### 2. Element Config

We create a `carousel/` subfolder in the `config/elements/` directory.

> `elements` are the building blocks of Slate. They have a `type` and are rendered as blocks (divs) unless otherwise specified. The other type of custom nodes are `text` nodes.

Let's declare the top-level configuration for our carousel element in an `index.tsx` file:

```code|lang-js
import { ElementConfigI } from '../../custom-types'
import { ContainerComponent } from '../../editor/Element'

export const config: ElementConfigI = {
  structure: [
    { type: 'carouselTitle' },
    { 
    	type: 'figure', 
    	repeat: true,
    	main: true
    }
  ]
}
```

There are two attributes here:

- the `component` key is used to find the correct React component to render this node with. This component is defined in the `schema` and passed through a `config` to the editor. We will come to that part soon.

- the `structure` array tells us that `carouselContainer` consists of a `carouselTitle` and multiple `figures`. If this isn't true, new nodes will be automatically inserted and/or deleted during the normalisation cycle of Slate, until our `carousel` complies with the structure. 
– the `main` attribute means that the `figure` element is the significant one in the `carousel` construct. If all figures get deleted by the user, the whole `carousel` should be deleted.

    > Structures work recursively. For instance, `figure` requires a `figureImage` and a `figureCaption`.

##### 3. Rendering Schema

Now we want to specify how exactly to render this `carousel` Slate node in React. This is done through the `schema` attribute of the `config` we pass to the `Editor`:

```code|lang-js
const BasicCarouselContainer = props => <div {...props} />

const schema: SchemaConfig = {
  headline: Editorial.Subhead,
  paragraph: Editorial.P,
  ...
  carousel: BasicCarouselContainer,
}

<Editor
    value={state.value}
    setValue={(newValue) => {
        setState({value: newValue})
    }}
    structure={state.structure}
    config={{ schema }}
/>
```

Slate has a [handful of requirements](https://docs.slatejs.org/walkthroughs/03-defining-custom-elements) for React components. They must:

- accept an `attributes` props and render them on the outermost element.
- render the `children` prop last
- if your element is "empty" as far as the editor is concerned (e.g. an image), use `style={{ userSelect: 'none' }}` or `contentEditable={false}`

#### Import a Styleguide Component

Now to `carouselTitle`. Same story as before: 

- We open `custom-types.d` and extend the types for `carouselTitle`:

```code|lang-js
export type CarouselTitleElement = SharedElement & {
  type: 'carouselTitle'
}

...

export type CustomElement =
  | HeadlineElement
  ...
  | CarouselContainerElement
  | CarouselTitleElement

...

export type CustomElementsType =
  | 'headline'
  ...
  | 'carouselContainer'
  | 'carouselTitle'
```

- We add a `config/carousel/title.tsx` config:

```code|lang-js
import { ElementConfigI } from '../../custom-types'
import { Editorial } from '@project-r/styleguide'

export const config: ElementConfigI = {}
```

- We complete the `schema`.

```code|lang-js
import { Editorial } from '@project-r/styleguide'

const schema: SchemaConfig = {
  headline: Editorial.Subhead,
  paragraph: Editorial.P,
  ...
  carousel: BasicCarouselContainer,
  carouselTitle: Editorial.Subhead,
}
```

#### Handle Custom Data

"Hey, but what if a component requires additional data?" you may ask. Good question. Let's look at `figureImage`:

`custom-types.d`:

```code|lang-js
export type FigureImageElement = SharedElement & {
  type: 'figureImage'
  src?: string
  srcDark?: string
  alt?: string
}
```

`config/element/figure/image.tsx`:

```code|lang-js
const Form: React.FC<ElementFormProps<FigureImageElement>> = ({
  element,
  onChange,
}) => (
  <div {...styles.container}>
    <div>
      <Label>Light mode</Label>
      <ImageInput
        src={element.src}
        onChange={(src) => {
          onChange({ src })
        }}
      />
    </div>
    <div>
      <Label>Dark mode (optional)</Label>
      <ImageInput
        src={element.srcDark}
        onChange={(srcDark) => {
          onChange({ srcDark })
        }}
      />
    </div>
  </div>
)

export const config: ElementConfigI = {
  Form,
  attrs: {
    isVoid: true,
    highlightSelected: true,
  },
  props: ['src', 'srcDark', 'alt'],
}
```

A few interesting things here:

- `props` matches the custom attributes defined in `custom-types.d`. Typescript isn't available on runtime, but we need to know which props belong to this element type and which don't, so we can erase the wrong props when needed.
- `Form` comes up in an overlay when someone doube clicks on the element and allows the write to edit the custom data. Parent elements' forms are pulled out and displayed as well. 

`schema`:

```code|lang-js
export const FigureImage: React.FC<{
  src?: string
  srcDark?: string
  alt?: string
  attributes: any
  [x: string]: unknown
}> = ({
  children,
  src = PLACEHOLDER,
  srcDark = PLACEHOLDER,
  alt,
  attributes,
  ...props
}) => (
  <div {...attributes} {...props}>
    <div contentEditable={false}>
      <InnerFigureImage src={src} dark={{ src: srcDark }} alt={alt} />
    </div>
    {children}
  </div>
)
```

This component signature and construction are a good example of a Slate-compliant component: 

- the `attributes` are passed as prop and spread on the outermost `div`
- the `children` come last (unlike in the real world)
- the custom props of the `element` (aka `src`, `srcDark`, etc.) are exploded upstream by the `render` function of the editor and come up as individual props.

#### Putting Things Together

Last but not least, we import our new configs into the main `elements/index.tsx` config:

```code|lang-js
...
import { config as carouselContainer } from './carousel/container'
import { config as carouselTitle } from './carousel/container'

export const config: ElementsConfig = {
  paragraph,
  headline,
  link,
  ...
  figureImage,
  carouselContainer,
  carouselTitle
}
```

> The key name should to match the type name of the element.

Take that, Oli. An unstyled div isn't much of a carousel, but you didn't expect me to do ALL your work for you, did you? Go scour the Internet if [the one from the Styleguide](https://styleguide.republik.ch/teasercarousel) isn't good enough for you.

### Adding New Marks

*Tuesday:* After the smashing success of yesterday, Katharina comes to find you in your fancy office. (You are a very important member of the organisation and your office is super glossy.) Katharina does marketing and she always erupts with crazy ideas, so you are getting nervous. Turns out she read this guide and ~~would like~~ **needs** the strikethrough effect for this winter's promotional campaign. You aren't fully convinced. "Isn't it going to be a bit much?" you think. But then again, no one pays you to think, right?

Lucky for you, this one's easy. Marks generally are. 

- You open `custom-types.d.ts` and extend the `MarkType` and `CustomMarks` types:

```code|lang-js
type MarkType = 'italic' | 'bold' | 'strikethrough'

...

type CustomMarks = {
  ...
  sup?: boolean
  strikethrough?: boolean
}
```

- You add a `strikethrough.tsx` file in `config/marks/`:

```code|lang-js
import { StrikeThrough } from '../../../Icons'

export const config: MarkConfigI = {
  button: { icon: StrikeThrough },
}
```

The `button` configuration object is the same for marks and elements alike.

- you include this config into `config/marks/index.tsx`:

```code|lang-js
...
import { config as strikethrough } from './strikethrough'

export const config: MarksConfig = {
  italic,
  bold,
  strikethrough
}
```

- Last step, you complete the schema, before getting back to Katharina with the satisfaction of a job well done:

```code|lang-js
const schema: SchemaConfig = {
  headline: Editorial.Subhead,
  paragraph: Editorial.P,
  ...
  strikethrough: Editorial.StrikeThrough,
}
```

## Concepts

### Editor config

We tried to build a config-first editor. The `config` object passed to the `Editor` component. Contains:

```table
span: 3
rows:
  - Variable: schema
    Description: schema config *(see below)*
  - Variable: editorSchema
    Description: schema config *(see below)*
  - Variable: toolbar
    Description: toolbar config *(see below)*
  - Variable: maxSigns
    Description: number
  - Variable: debug
    Description: boolean  
```

#### schema config

```table
span: 3
rows:
  - Variable: ExtendedElementType or CustomMarksType key
    Description: React component
```

If something needs to be rendered differently in the editor and in the live version, you can use the `editorSchema` to specify the rendering of the editor (e.g. flyer quiz).

#### toolbar config

```table
span: 3
rows:
  - Variable: mode
    Description: sticky (default), fixed or floating
  - Variable: style
    Description: css styles to add to the toolbar
  - Variable: styleInner
    Description: css styles to add to the inner toolbar
  - Variable: showChartCount
    Description: boolean
  - Variable: alsoRender
    Description: React component
```

Most of these options are useful to integrate the editor gracefully somewhere else (e.g. in Publikator)

### Slate Node config

The individual `config/` files for marks and elements describe the rules according to which the Slate node exists.

#### Element Config

```table
span: 3
rows:
  - Variable: component
    Description: ExtendedElementType key
  - Variable: attrs
    Description: attrs config *(see below)*
  - Variable: normalizations
    Description: array of normaliser functions
  - Variable: structure
    Description: array of `NodeTemplate`
  - Variable: Form
    Description: data form
  - Variable: button
    Description: button config *(see below)*
  - Variable: props
    Description: array of custom props keys
  - Variable: defaultProps
    Description: default values for custom props
```

#### `ExtendedElementType`
Any element type, e.g. `figureImage`, plus a few custom ones such as `list` or `container`

#### attrs config

Extended core Slate attributes:

```table
span: 3
rows:
  - Variable: isVoid
    Description: boolean
  - Variable: isInline
    Description: boolean
  - Variable: highlightSelected
    Description: boolean *(for void elements)*
  - Variable: formatText
    Description: boolean
  - Variable: blockUi
    Description: block UI attributes *(if applicable)*
```

#### `blockUi`

```table
span: 3
rows:
  - Variable: position
    Description: absolute css positionning of the block
```

#### `NodeTemplate`

```table
span: 3
rows:
  - Variable: type
    Description: element type or array of types
  - Variable: repeat
    Description: boolean
  - Variable: end
    Description: boolean *(only for inline nodes)*
```

#### button config

```table
span: 3
rows:
  - Variable: icon
    Description: React Icon
  - Variable: small
    Description: boolean
```

#### Mark Config

```table
span: 3
rows:
  - Variable: component
    Description: CustomMarksType key
  - Variable: remove
    Description: array to CustomMarksType keys
  - Variable: button
    Description: button config *(see above)*
```

#### `remove`

Optional array of `CustomMarksType` keys which are to be removed when a mark is added. E.g. `['sup']` is incompatible with `sub`.

### Structure

A `structure` is an array of `NodeTemplate`. Each `NodeTemplate` specifies the type of the element (single element or an array of them) and whether the element is unique or can be repeated. It also tells us which is the main element of the construct. That's useful for deleting and converting nodes. 

Example: the image node of a figure is the main node of the figure structure (image + caption). If the writer deletes the image, the whole figure gets removed.

`figureCaption` is a good example:

```code|lang-js
export const config: ElementConfigI = {
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

Limitation: structures cannot be ambiguous. The following structure won't work:

```code|lang-js
// Don't try this at home!
structure: [
  { type: ['text', 'link'], repeat: true },
  { type: 'link' },
  { type: 'text', end: true }
]
```
**Refactoring:** make top level structure optional. Default to: `{ type: [BLOCK_BUTTONS], repeat: true }`

### Custom Data and Forms

If the node needs custom props, those should be declared in the type manifest, and as well as in the config file of the node.

`custom-types.d`:

```code|lang-js
export type FigureImageElement = SharedElement & {
  type: 'figureImage'
  src?: string
  srcDark?: string
  alt?: string
}
```

`config/element/figure/image.tsx`:

```code|lang-js
export const config: ElementConfigI = {
  Form,
  attrs: {
    isVoid: true,
    highlightSelected: true,
  },
  props: ['src', 'srcDark', 'alt'],
}
```

The `Form` in the config provides an interface to edit a node's data and is loaded when the writer double-clicks the element:

```code|lang-js
const Form: React.FC<ElementFormProps<FigureImageElement>> = ({
  element,
  onChange,
}) => (
  <div {...styles.container}>
    <div>
      <Label>Light mode</Label>
      <ImageInput
        src={element.src}
        onChange={(src) => {
          onChange({ src })
        }}
      />
    </div>
    <div>
      <Label>Dark mode (optional)</Label>
      <ImageInput
        src={element.srcDark}
        onChange={(srcDark) => {
          onChange({ srcDark })
        }}
      />
    </div>
  </div>
)
```

### Insert Element

There are two ways for a writer to insert a new element can be inserted into the Slate tree.

1. On enter
2. Keyboard shortcuts

#### On Enter

If the `structure` allows for repeats, we insert the first matching element. If it doesn't, we navigate to the next element (as would happen on Tab).

First matching element = closest repeatable element forward in the Slate tree **and** first element in the template type array. For instance if our structure specifies the following types: `['paragraph', 'figure', 'pullQuote']`, the Enter key will trigger the insertion of a new paragraph, even if the cursor is in a figure or a quote.

#### Keyboard Shortcuts

`insertOnKey` triggers the insertion of a specific element on a special key combo.

For instance, `Enter+shift` inserts a `break` element:

```code|lang-js
<Editable
  renderElement={renderElement}
  renderLeaf={renderLeaf}
  onKeyDown={event => {
    insertOnKey({ name: 'Enter', shift: true }, 'break')(editor, event)
    ...
  }}
/>
```

### Normalisation

Every time the value of the document changes (in plain text: every time someone edits something), Slate runs a normalisation cycle, where it checks that the document is still valid and fixes any problem.

Every time one problem is fixed, the normalisation function returns, and runs again. This prevents issues such as: a node is deleted, but a subsequent normaliser hasn't gotten the memo and tries to access it.

While Slate also has [its own agenda](https://docs.slatejs.org/concepts/11-normalizing#built-in-constraints), normalisations can be extended ad lib. Which we did.

#### Fix Structure

This is the most complex piece of custom normalisation in the project. Given a Slate node, we check that it conforms to the specified `structure` and iteratively fix the problems.

The normalisation reruns until the Slate tree is stable, meaning that if a new element is inserted, it will move along the descendants automatically. So the structure only has to worry about first-level descendants. Example:

```code|lang-js
export const config: ElementConfigI = {
  Component,
  Form,
  structure: [{ type: 'figureImage' }, { type: 'figureCaption' }],
  button: { icon: ImageIcon }
}
```

While `figureCaption` has its own structure requirements, they are no our concern right now, and can be specified as part of `figureCaption`'s own configuration.

Conversely, if an element config doesn't specify a structure, we default to:

```code|lang-js
const DEFAULT_STRUCTURE = [{ type: ['text'], repeat: true }]
```

#### End Nodes

One of Slate's [built-in constraints](https://docs.slatejs.org/concepts/11-normalizing#built-in-constraints) is that inline nodes cannot be the first or last nodes of a parent block. This is annoying. 

See once more `figureCaption`, where `figureByline` should be the last element:

```code|lang-js
export const config: ElementConfigI = {
  structure: [
    { type: ['text', 'link'], repeat: true },
    { type: 'figureByline' },
    { type: 'text', end: true }
  ],
  ...
}
```

We solve the problem by adding an attribute called `end` to text nodes. End nodes can be placed at either end of the structure and do not contain any text. If someone starts writing inside an end node, the text gets reallocated to the nearest non-end node in the next normalisation cycle.

#### Linking

We create links automatically if the writer types/pastes a link-like text.

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

Note that: a correct normaliser should break and return `true` when it changes something to the Slate tree, `false` otherwise.

### Toolbar

Any element/mark that defines a `button` in the config can be rendered in the toolbar. Every mark comes up as a button by default.

Depending on the config value, the toolbar can be either `sticky`, `fixed` or `floating`, `sticky` being the default.

### Placeholders

The `LeafComponent` renders text nodes and adds placeholder text when no actual text is present. The placeholder text is determined by the type of the parent element (e.g. `title` or `paragraph`).

### Character Count

The last important feature of something named "kurzformat" is the length – or rather, the shortness – for which we use the `withCharLimit` decorator.

This decorator intercepts Slate's `insertText`, `insertFragment` and `insertNode` and triggers an early return wheneverr the aggregate of all text in the editor is more than the number of `maxSigns` specified in the editor config (currently 3000).
