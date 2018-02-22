A preconfigured article template for dossier pages.

```code|lang-jsx
import createDossierSchema from '@project-r/styleguide/lib/templates/Dossier'

const schema = createDossierSchema()
```

`createDossierSchema` take an optional options object with following keys:

- `dossierLabel`, label, defaults to `Dossier`
- `dossierHref`, href of dossier overview page, defaults to `/dossier`
- all keys from article template

Defaults:
- `repoPrefix`, `dossier-`
- `getPath`, `/dossier/:slug`
- `customMetaFields`, always adds repo ref for `discussion`
- `series`, false

# Example

```react|noSource
<Markdown schema={schema}>{`

<section><h6>TITLE</h6>

# Die Welt von Gregor Samsa

Jemand musste Josef K. verleumdet haben, denn ohne dass er etwas Böses getan hätte, wurde er eines Morgens verhaftet. «Wie ein Hund!» sagte er, es war, als sollte die Scham ihn überleben.

<hr /></section>

<section><h6>CENTER</h6>

Und es war ihnen wie eine Bestätigung ihrer neuen Träume und guten Absichten, als am Ziele ihrer Fahrt die Tochter als erste sich erhob und ihren jungen Körper dehnte. «Es ist ein eigentümlicher Apparat», sagte der Offizier zu dem Forschungsreisenden und überblickte mit einem gewissermaßen bewundernden Blick den ihm doch wohlbekannten Apparat. «Es ist ein eigentümlicher Apparat», sagte der Offizier zu dem Forschungsreisenden und überblickte mit einem gewissermaßen bewundernden Blick den ihm doch wohlbekannten Apparat.

<section><h6>TEASER</h6>

\`\`\`
{
  "kind": "meta",
  "teaserType": "articleDossier"
}
\`\`\`

## Diese Artikel sind im Dossier enthalten:

<section><h6>TEASERGROUP</h6>

<section><h6>TEASER</h6>

\`\`\`
{
  "kind": "editorial",
  "teaserType": "articleTile",
  "url": "https://www.republik.ch/updates/portraets"
}
\`\`\`

![](https://assets.republik.ch/images/pierre_rom.jpeg?size=853x853)

###### Echte Republikaner

# Pierre

#### Republik-Verleger, 93 Jahre

Foto: [Laurent Burst](/~349ef65b-119a-4d3e-9176-26517855d342 "Laurent Burst")

<hr /></section>

<section><h6>TEASER</h6>

\`\`\`
{
  "kind": "interaction",
  "teaserType": "articleTile",
  "url": "https://www.republik.ch/updates/portraets"
}
\`\`\`

###### Aus der Redaktion

# Unsere aktuellen Recherchen zum Thema Gregor Samsa


<hr /></section>

<section><h6>TEASER</h6>

\`\`\`
{
  "kind": "editorial",
  "teaserType": "articleTile",
  "url": "https://www.republik.ch/updates/portraets"
}
\`\`\`

![](https://assets.republik.ch/images/mavie.jpeg?size=848x848)

###### Echte Republikaner

# Mavie

#### Republik-Verlegerin, 8 Monate

Foto: [Laurent Burst](/~349ef65b-119a-4d3e-9176-26517855d342 "Laurent Burst")

<hr /></section>

<hr /></section>

<hr /></section>

<hr /></section>

`}</Markdown>
```
