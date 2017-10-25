We use a simple `t` function to keep user interface text out of the code base.

```
t(key, [replacements], [missingValue]): string
t.elements(key, [replacements], [missingValue]): ReactNode[]

t.first(keys, [replacements], [missingValue]): string
t.first.elements(keys, [replacements], [missingValue]): ReactNode[]

t.pluralize(baseKey, replacements, [missingValue]): string
t.pluralize.elements(baseKey, replacements, [missingValue]): ReactNode[]
```

- `key`: string, translation key
- `replacements`: object | undefined, required for pluralize
- `missingValue`: string | undefined, defaults to `TK(${key})`
- `keys`: string[], array of translations keys
- `baseKey`: string, translation base key for pluralization

**Advanced Features**

**`t.elements`** can handle React components as replacements. It returns an array of strings and replacement objects, e.g. `t.elements('greetings', {name: <em key='name'>Thomas</em>})` returns `['Hello ', <em key='name'>Thomas</em>]`. You are responsible to add React keys to your replacement elements.

**`t.first`** takes an array of translation keys. And uses the first one present. This can be useful for labeling, e.g. a dynamic label for some fields and a generic fallback for others. Also used internally by `t.pluralize`.

**`t.first.elements`** combines `t.elements` and `t.first` functionality.

**`t.pluralize`** is a convenience helper for pluralization. It requires an replacements object with an count. Under the hood it translates to `t.first` and enforces following key convention for consistency:
```
t.first([
  `${baseKey}/${replacements.count}`,
  `${baseKey}/other`
])
```

**`t.pluralize.elements`** combines `t.elements` and `t.pluralize` functionality.

## Creating a Formatter

```code|lang-js
import {createFormatter} from '@project-r/styleguide'

const t = createFormatter([
  {key: 'styleguide/Hello/generic', value: 'Hallo!'},
  {key: 'styleguide/Hello/greetings', value: 'Hallo {name}'},
  {key: 'styleguide/Hello/greetings/Thomas', value: 'Hoi Thomas'},
  {key: 'styleguide/Hello/message/0', value: 'Sie waren noch nie hier'},
  {key: 'styleguide/Hello/message/1', value: 'Willkommen an Bord {name}!'},
  {key: 'styleguide/Hello/message/2', value: 'Schön Sie wieder zu sehen!'},
  {key: 'styleguide/Hello/message/other', value: 'Willkommen zum {count}. Mal {name}!'},
  {key: 'styleguide/Hello/label/visits', value: 'Anzahl Besuche'},
  {key: 'styleguide/Hello/label/name', value: 'Name'},
])
```

### Higher-Order Component

Apps should use an HOC to provide `t`. For example loading from an static json file:

```
import {createFormatter} from '@project-r/styleguide'

const t = createFormatter(require('./translations.json').data)

export default (Component) => (props) => (
  <Component {...props} t={t} />
)
```

Usually we setup a gsheet to manage our translations and download them with  `npm run translations` – running  `gsheets --key=$GSHEET_ID --title=live --pretty --out lib/translations.json`.

### Placeholder Formatter

```
import {createPlaceholderFormatter} from '@project-r/styleguide'

createPlaceholderFormatter([placeholder = ''])
```

You can use a placeholder formatter, e.g. while loading real translation data from an API.

## Usage Examples

```code|lang-js
t('styleguide/Hello/generic')
```

```code|lang-js
t('styleguide/Hello/greetings', {
  name: 'Thomas'
})
```

```code|lang-jsx
t.elements('styleguide/Hello/greetings', {
  name: <em key='name'>Thomas</em>
})
```

```code|lang-js
t(`styleguide/Hello/label/${fieldName}`, undefined, fieldName)
```

```code|lang-js
t.first([`styleguide/Hello/label/${fieldName}`, 'styleguide/Hello/label/generic'])
```

```code|lang-js
t.pluralize('styleguide/Hello/message', {
  count: 1,
  name: 'Thomas'
})
```

## Interactive Example

```react
state: {visits: 0, name: 'Thomas'}
---
<div>
  <Interaction.H2>
    {t('styleguide/Hello/generic')}
  </Interaction.H2>
  <Interaction.H3>
    {t.first(
      [`styleguide/Hello/greetings/${state.name}`, 'styleguide/Hello/greetings'],
      {name: state.name}
    )}
  </Interaction.H3>
  <Interaction.P>
    {t.pluralize.elements('styleguide/Hello/message', {
      count: state.visits,
      name: <em key='name'>{state.name}</em>
    })}
  </Interaction.P>
  <br /><br />
  {Object.keys(state).map(key => (
    <Field key={key}
      label={t(`styleguide/Hello/label/${key}`, undefined, key)}
      value={String(state[key])}
      onChange={(_, value) => setState({[key]: value})}
      onInc={key === 'visits' && (() => setState({[key]: state[key] + 1}))}
      onDec={key === 'visits' && (() => setState({[key]: state[key] - 1}))} />
  ))}
</div>
```

