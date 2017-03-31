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

### Integration with Third-Party

Integration is possible with any input component which support `value`, `onChange`, `onFocus`, `onBlur` and `className`. To do so use a custom `renderInput`, see examples below.

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

#### Example with `react-autocomplete`

```react
state: {
  value: '',
  items: ['Schweiz', 'Deutschland', 'Österreich']
}
---
<Field
    value={state.value}
    onChange={(_, value) => setState({
      value,
      items: ['Schweiz', 'Deutschland', 'Österreich']
        .filter(d => d.indexOf(value) === 0)
    })}
    label='Land'
    renderInput={({value, onChange, ...props}) => (
      <Autocomplete
        value={value}
        inputProps={props}
        onChange={onChange}
        onSelect={(value, item) => setState({value})}
        items={state.items}
        getItemValue={item => item}
        wrapperStyle={{position: 'relative'}}
        renderMenu={(items, value, style) => (
          <div style={{position: 'absolute', backgroundColor: 'white', top: 40, left: 0, width: '100%'}}>
            {items}
          </div>
        )}
        renderItem={(item, isHighlighted) => (
          <div
            style={{
              backgroundColor: isHighlighted ? '#EBF6E5' : '',
              borderBottom: '1px solid #ccc',
              padding: '10px 0'
            }}
            key={item}
          >{item}</div>
        )} />
    )} />
```

`npm i react-autocomplete --save`  
`import Autocomplete from 'react-autocomplete'`

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