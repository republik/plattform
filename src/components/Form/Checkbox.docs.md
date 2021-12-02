```react
state: {checked: false}
---
<Checkbox
  checked={state.checked}
  onChange={(_, checked) => setState({checked})}>
  Ich akzeptiere die
  {' '}
  <A target='_blank' href='https://www.republik.ch/legal/agb'>
    Allgemeine Geschäftsbedingungen
  </A>
</Checkbox>
```

```react
<Checkbox checked onChange={() => {}}>
  Ich akzeptiere
</Checkbox>
```

```react
<Checkbox checked onChange={() => {}}>
  Eine wunderbare Heiterkeit hat meine ganze Seele eingenommen, gleich den süßen Frühlingsmorgen, die ich mit ganzem Herzen genieße.
</Checkbox>
```

```react
<Checkbox disabled onChange={() => {}}>
  Ich akzeptiere
</Checkbox>
```

```react
<Checkbox checked disabled onChange={() => {}}>
  Ich akzeptiere
</Checkbox>
```

```react
<Checkbox black checked onChange={() => {}}>
  Ich akzeptiere
</Checkbox>
```

```react
<Checkbox error onChange={() => {}}>
  Ich akzeptiere
</Checkbox>
```

## Without Label

In a table, e.g. an election table, one might use checkboxs without a label. The component will skip font styles and line height styles in that case.

```react
state: {
  values: []
}
---
<GetColorScheme>
  {(colorScheme) => (
    <table style={{ textAlign: 'left', width: '100%' }} {...colorScheme.set('color', 'text')} cellspacing='0'>
      <tbody>
        <tr>
          <th>Name</th>
          <th>Ort</th>
          <th></th>
        </tr>
        {[['Anna', 'Genf'], ['Sascha', 'Bern'], ['Thomas', 'Zürich']].map(([name, place], i) => (
          <tr {...colorScheme.set('backgroundColor', i % 2 ? 'hover' : 'default')}>
            <td style={{ padding: '5px 0' }}>{name}</td>
            <td style={{ padding: '5px 0' }}>{place}</td>
            <td style={{ padding: '5px 0' }}>
              <Checkbox
                value={name}
                checked={state.values.includes(name)}
                onChange={(_, checked) => setState({values: checked
                  ? [...state.values, name]
                  : state.values.filter(n => n !== name)
                })}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</GetColorScheme>
```
