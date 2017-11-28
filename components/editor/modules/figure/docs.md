# editorOptions

`afterType`, type string, block to create when pressing enter in the caption

`sizes`, array of objects with following keys
- `label`, string, radio label
- `props`, object of data to be merged with figure data when selected
- `parent`, object with following keys, optional, only show this option when parent matches
  - `kinds`, array of slate kinds
  - `types`, array of slate types
- `unwrap`, bool, unwrap figure until is a child of document when selected
- `wrap`, slate type, ensure figure is wrapped in block with this type when selected

## Example: Float Sizes

```
[
  {label: 'Gross', props: {float: undefined}},
  {label: 'Left', props: {float: 'left'}},
  {label: 'Right', props: {float: 'right'}},
]
```

## Example: Edge-to-Edge Sizes

```
{
  label: 'Edge-to-Edge',
  props: {size: undefined},
  parent: {kinds: ['document', 'block'], types: ['CENTER']},
  unwrap: true
},
{
  label: 'Normal',
  props: {size: undefined},
  parent: {kinds: ['document', 'block'], types: ['CENTER']},
  wrap: 'CENTER'
}
```
