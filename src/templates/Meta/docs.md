The meta template is mostly equivalent to the editorial template. The main difference is the sans-serif title block headline.

```
import createMetaSchema from '@project-r/styleguide/lib/templates/Meta'

const schema = createMetaSchema({
  titleBlockAppend: <div>Share Actions</div>
})
```

`createMetaSchema` forwards to `createEditorialSchema`. See [editorial documentation for arguments](/templates/editorial).

# Example

```react|noSource
<Markdown schema={schema}>{`

<section><h6>TITLE</h6>

# Gregor Samsa eines Morgens aus unruhigen Träumen

Jemand musste Josef K. verleumdet haben, denn ohne dass er etwas Böses getan hätte, wurde er eines Morgens verhaftet. «Wie ein Hund!» sagte er, es war, als sollte die Scham ihn überleben.

Von [Franz Kafka](<>) (Text) und [Laurent Burst](<>) (Bilder), 13. Juli 2017

<hr /></section>

<section><h6>CENTER</h6>

Und es war ihnen wie eine Bestätigung ihrer neuen Träume und guten Absichten, als am Ziele ihrer Fahrt die Tochter als erste sich erhob und ihren jungen Körper dehnte. «Es ist ein eigentümlicher Apparat», sagte der Offizier zu dem Forschungsreisenden und überblickte mit einem gewissermaßen bewundernden Blick den ihm doch wohlbekannten Apparat.

## Wie ein Hund!

In den letzten Jahrzehnten ist das Interesse an Hungerkünstlern sehr zurückgegangen.

<section><h6>FIGURE</h6>

![](/static/landscape.jpg)

Etwas Böses _Foto: Laurent Burst_

<hr /></section>

«Es ist ein eigentümlicher Apparat», sagte der Offizier zu dem Forschungsreisenden und überblickte mit einem gewissermaßen bewundernden Blick den ihm doch wohlbekannten Apparat.

<hr /></section>

`}</Markdown>
```

## Title Block

```react|noSource
<Markdown schema={schema}>{`
<section><h6>TITLE</h6>

# Gregor Samsa eines Morgens aus unruhigen Träumen

Jemand musste Josef K. verleumdet haben, denn ohne dass er etwas Böses getan hätte, wurde er eines Morgens verhaftet. «Wie ein Hund!» sagte er, es war, als sollte die Scham ihn überleben.

Von [Franz Kafka](<>) (Text) und [Everett Collection](<>) (Bilder), 13. Juli 2017

<hr /></section>
`}</Markdown>
```

### `center`

Values: `falsy` (default), `true`

```react|noSource
<Markdown schema={schema}>{`
<section><h6>TITLE</h6>

\`\`\`
{"center": true}
\`\`\`

# Gregor Samsa eines Morgens aus unruhigen Träumen

Jemand musste Josef K. verleumdet haben, denn ohne dass er etwas Böses getan hätte, wurde er eines Morgens verhaftet. «Wie ein Hund!» sagte er, es war, als sollte die Scham ihn überleben.

Von [Franz Kafka](<>) (Text) und [Everett Collection](<>) (Bilder), 13. Juli 2017

<hr /></section>
`}</Markdown>
```
