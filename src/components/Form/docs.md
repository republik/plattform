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