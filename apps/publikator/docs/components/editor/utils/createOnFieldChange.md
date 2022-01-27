# *function* createOnFieldChange

Helper function to create a simple setter/remover event handler for a given key in a given nodes data container.
Best used in property forms or wherever you deal with `node.data` maps.

It aims at following the event handler signature introduced by the [Styleguides Field Component](https://styleguide.republik.ch/forms#change-and-validation).

As the signature implies, this helper is fully partially applicable.

###### Location

`components/editor/utils/createOnFieldChange.js`

###### Signature

```
createOnFieldChange =
  onChange: Function =>
  value: Value =>
  node: Node =>
  key: String =>
  event: Event =>
  value: any =>
  any
```

###### Example

This could be a link property form

```
const Form = ({ disabled, value, onChange }) => {

  const handlerFactory = createOnFieldChange(onChange, value)

  return <div>
    <Label>Links</Label>
    {
      value.inlines
        .filter(node => node.kind === 'inline' && node.type === 'link')
        .map((node, i) => {

          return (
            <Field
              key={`link-${i}`}
              value={node.data.get('href')}
              onChange={handlerFactory(node, 'href')}
            />
            <Field
              key={`link-${i}`}
              value={node.data.get('title')}
              onChange={handlerFactory(node, 'title')}
            />
          )
        })
    }
  </div>
}
```
