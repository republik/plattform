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

### E-Mail

```html
<label>
    Deine E-Mail:<br />
    <input type="email" placeholder="max.muster@example.com" />
</label>
```

## Zahlungsmethoden

```html
<button>PostFinance</button> <button>Kreditkarten</button> <button>Einzahlungsschein</button>
```

## Komposition

```html
<form>
    <h3>Deine Unterstützung</h3>
    <p>
        ...
    </p>

    <h3>Deine Kontaktinformationen</h3>
    <p>
        <label>
            Dein Name:<br />
            <input type="text" placeholder="Max Muster" />
        </label>
    </p>

    <p>
        <label>
            Deine E-Mail:<br />
            <input type="email" placeholder="max.muster@example.com" />
        </label>
    </p>

    <h3>Zahlungsart auswählen</h3>
    <p>
        <button>PostFinance</button> <button>Kreditkarten</button> <button>Einzahlungsschein</button>
    </p>
</form>
```