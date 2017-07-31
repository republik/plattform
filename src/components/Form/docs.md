## Fields

```react|span-3
<Field label='Label' />
```

```react|span-3
<Field label='Label' simulate='focus' />
```

```react|span-3
<Field
    label='E-Mail-Adresse'
    error='Geben sie eine gültige E-Mail-Adresse an' />
```

### Increase and Decrease

```react
state: {
  value: 240
}
---
<Field
  label='Betrag'
  value={state.value}
  onChange={(_, value) => setState({value})}
  onInc={() => setState({value: state.value + 10})}
  onDec={() => setState({value: state.value - 10})} />
```

### Black and White

```react|span-3
<Field black label='Label' />
```

```react|span-3,dark
<Field white label='Label' />
```

### Change and Validation

`onChange` gets called with the following arguments:

- `event: SyntheticEvent`
- `value: String`
- `shouldValidate: Boolean`

`shouldValidate` is a hint to run any necessary validations, if they fail an `error` should be set on the field.

`shouldValidate` becomes `true` after on the first blur if the field has been changed. An additional `onChange` is triggered when is happens.

```react
state: {
  value: ''
}
---
<Field
    label='Name'
    value={state.value}
    error={state.error}
    onChange={(event, value, shouldValidate) => {
      setState({
        error: (
          shouldValidate &&
          !value.trim().length &&
          'Geben sie Ihren Namen an'
        ),
        value: value
      })
    }} />
```

### Autocomplete

You can provide a `items` array which will be suggested to the user. Powered by `react-autocomplete`.

```react|span-3
<AutosuggestField
    label='Land'
    items={[
      'Schweiz',
      'Deutschland',
      'Österreich'
    ]} />
```

```react|span-3
state: {
  value: ''
}
---
<AutosuggestField
    label='Monat'
    items={[
      '01', '02', '03', '04', '05', '06',
      '07', '08', '09', '10', '11', '12'
    ]}
    value={state.value}
    error={state.error}
    onChange={(event, value, shouldValidate) => {
      setState({
        error: (
          shouldValidate &&
          !value.trim().length &&
          'Monat fehlt'
        ),
        value: value
      })
    }} />
```


### Integration with Third-Party

Integration is possible with any input component which support `value`, `onChange`, `onFocus`, `onBlur` and `className`. To do so use a custom `renderInput`, see example below.

#### Example with `react-maskedinput`

```react
state: {
  value: '4242424242424242'
}
---
<Field
    value={state.value}
    onChange={(_, value) => setState({value})}
    label='Kreditkarten-Nummer'
    renderInput={props => <MaskedInput {...props} placeholderChar=" " mask="1111 1111 1111 1111" />} />
```

`npm i react-maskedinput --save`  
`import MaskedInput from 'react-maskedinput'`

## Checkbox

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

## Radio

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
    checked={state.value === 'maybe'}
    onChange={(event) => setState({value: event.target.value})}>
    Vielleicht
  </Radio>
</P>
```

## Composition

```react|noSource
<form>
  <Interaction.H2>Deine Unterstützung</Interaction.H2>
  <p>
    ...
  </p>

  <Interaction.H2>Deine Kontaktinformationen</Interaction.H2>
  <p style={{marginTop: 0}}>
    <Field label='Dein Name' />
    <Field label='Deine E-Mail' />
  </p>

  <p>
    <Checkbox>
      Ich akzeptiere
    </Checkbox>
  </p>

  <Button>Weiter</Button>
</form>
```