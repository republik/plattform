## Felder

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
<AutocompleteField
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
<AutocompleteField
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

## Zahlungsmethoden

```html
<label><input type="radio" name="paymentMethod"/> Banküberweisung </label>
<label><input type="radio" name="paymentMethod"/> Mastercard </label>
<label><input type="radio" name="paymentMethod"/> Visa </label>
<label><input type="radio" name="paymentMethod"/> Postcard </label>
<label><input type="radio" name="paymentMethod"/> Postfinance </label>
<label><input type="radio" name="paymentMethod"/> Paypal </label>
<label><input type="radio" name="paymentMethod"/> Twint </label>
```

## Komposition

```react|noSource
<form>
  <h3>Deine Unterstützung</h3>
  <p>
    ...
  </p>

  <h3 style={{marginBottom: 0}}>Deine Kontaktinformationen</h3>
  <p style={{marginTop: 0}}>
    <Field label='Dein Name' />
    <br />
    <Field label='Deine E-Mail' />
  </p>

  <h3>Zahlungsart auswählen</h3>
  <p>
    <label><input type="radio" name="paymentMethod"/> Banküberweisung </label>
    <label><input type="radio" name="paymentMethod"/> Mastercard </label>
    <label><input type="radio" name="paymentMethod"/> Visa </label>
    <label><input type="radio" name="paymentMethod"/> Postcard </label>
    <label><input type="radio" name="paymentMethod"/> Postfinance </label>
    <label><input type="radio" name="paymentMethod"/> Paypal </label>
    <label><input type="radio" name="paymentMethod"/> Twint </label>
  </p>

  <Button>Weiter</Button>
</form>
```