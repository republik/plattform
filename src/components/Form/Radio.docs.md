
```react
state: {value: 'yes'}
---
<P>
  <Radio
    value='yes'
    checked={state.value === 'yes'}
    onChange={(event) => setState({value: event.target.value})}>
    Ja
  </Radio>
  <br />
  <Radio
    value='no'
    checked={state.value === 'no'}
    onChange={(event) => setState({value: event.target.value})}>
    Nein
  </Radio>
  <br />
  <Radio
    value='maybe'
    disabled={true}
    onChange={(event) => setState({value: event.target.value})}>
    Vielleicht
  </Radio>
  <br />
  <Radio
    value='never'
    checked={true}
    disabled={true}
    onChange={(event) => setState({value: event.target.value})}>
    Niemals
  </Radio>
</P>
```

## Without Label

In a table, e.g. an election table, one might use radios without a label. The component will skip font styles and line height styles in that case.

```react
state: {}
---
<GetColorScheme>
  {(colorScheme) => (
    <table style={{ textAlign: 'left', width: '100%' }} {...colorScheme.set('color', 'text')} cellspacing='0'>
      <tbody>
        <tr>
          <th>Name</th>
          <th>Geschlecht</th>
          <th></th>
        </tr>
        {[['Anna', 'weiblich'], ['Sascha', 'non-binär'], ['Thomas', 'männlich']].map(([name, gender], i) => (
          <tr {...colorScheme.set('backgroundColor', i % 2 ? 'hover' : 'default')}>
            <td style={{ padding: '5px 0' }}>{name}</td>
            <td style={{ padding: '5px 0' }}>{gender}</td>
            <td style={{ padding: '5px 0' }}>
              <Radio
                value={name}
                checked={state.value === name}
                onChange={(event) => setState({value: event.target.value})}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</GetColorScheme>
```
