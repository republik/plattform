```code|lang-jsx
import createEditorialSchema from '@project-r/styleguide/lib/templates/Editorial'

const schema = createEditorialSchema({
  titleBlockAppend: <div>Share Actions</div>
})
```

`createEditorialSchema` take an optional options object with following keys:

- `documentEditorOptions`, forward options to the document editor module
- `titleBlockAppend`, append React elements—e.g. share icons—to the title block

# Normal article

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

![](/static/landscape.jpg?size=2000x1411)

Etwas Böses _Foto: Laurent Burst_

<hr /></section>

«Es ist ein eigentümlicher Apparat», sagte der Offizier zu dem Forschungsreisenden und überblickte mit einem gewissermaßen bewundernden Blick den ihm doch wohlbekannten Apparat.

<section><h6>INFOBOX</h6>

### Trapattoni '98

Es gibt keine deutsche Mannschaft spielt offensiv und die Name offensiv wie Bayern. Letzte Spiel hatten wir in Platz drei Spitzen: Elber, Jancka und dann Zickler. Wir müssen nicht vergessen Zickler.

<hr /></section>

<section><h6>QUOTE</h6>

Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.

Thomas Jefferson

<hr /></section>

<hr /></section>

`}</Markdown>
```

# Dossier article

```react|noSource
<Markdown schema={schema}>{`

<section><h6>TITLE</h6>

###### Dossier

# Die Welt von Gregor Samsa

Jemand musste Josef K. verleumdet haben, denn ohne dass er etwas Böses getan hätte, wurde er eines Morgens verhaftet. «Wie ein Hund!» sagte er, es war, als sollte die Scham ihn überleben.

<hr /></section>

<section><h6>CENTER</h6>

Und es war ihnen wie eine Bestätigung ihrer neuen Träume und guten Absichten, als am Ziele ihrer Fahrt die Tochter als erste sich erhob und ihren jungen Körper dehnte. «Es ist ein eigentümlicher Apparat», sagte der Offizier zu dem Forschungsreisenden und überblickte mit einem gewissermaßen bewundernden Blick den ihm doch wohlbekannten Apparat. «Es ist ein eigentümlicher Apparat», sagte der Offizier zu dem Forschungsreisenden und überblickte mit einem gewissermaßen bewundernden Blick den ihm doch wohlbekannten Apparat.

<section><h6>TEASER</h6>

\`\`\`
{
  "kind": "meta",
  "teaserType": "articleCollection"
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


## Figure

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

Etwas Böses _Foto: Laurent Burst_

<hr /></section>

<hr /></section>
`}</Markdown>
```

### Edge-to-Edge

Simpy unwrap from center

```react|noSource
<Markdown schema={schema}>{`
<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

Etwas Böses _Foto: Laurent Burst_

<hr /></section>
`}</Markdown>
```

### `size`

Values: `undefined` (default), `breakout`

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

Überall dieselbe alte Leier. Das Layout ist fertig, der Text lässt auf sich warten. Damit das Layout nun nicht nackt im Raume steht und sich klein und leer vorkommt, springe ich ein: der Blindtext.

<section><h6>FIGURE</h6>

\`\`\`
{"size": "breakout"}
\`\`\`

![](/static/landscape.jpg?size=2000x1411)

Etwas Böses _Foto: Laurent Burst_

<hr /></section>

<hr /></section>
`}</Markdown>
```

### Figure Group

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

Überall dieselbe alte Leier. Das Layout ist fertig, der Text lässt auf sich warten. Damit das Layout nun nicht nackt im Raume steht und sich klein und leer vorkommt, springe ich ein: der Blindtext.

<section><h6>FIGUREGROUP</h6>

<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

<hr /></section>

<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

<hr /></section>

This is a caption stretching beautifully across the group of all images as you can see above. _Foto: Laurent Burst_

<hr /></section>

<hr /></section>
`}</Markdown>
```

#### `columns`

Values: `2` (default), `3`, `4`

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

Überall dieselbe alte Leier. Das Layout ist fertig, der Text lässt auf sich warten. Damit das Layout nun nicht nackt im Raume steht und sich klein und leer vorkommt, springe ich ein: der Blindtext.

<section><h6>FIGUREGROUP</h6>

\`\`\`
{"columns": 3}
\`\`\`

<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

Ein Monster

<hr /></section>

<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

Wirklich

<hr /></section>

<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

MONSTER!

<hr /></section>

_Foto: Laurent Burst_

<hr /></section>

Was für eine Erleichterung. Standards sparen Zeit bei den Entwicklungskosten und sorgen dafür, dass sich Webseiten später leichter pflegen lassen. Natürlich nur dann, wenn sich alle an diese Standards halten.

<hr /></section>
`}</Markdown>
```

## Pull Quote

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

<section><h6>QUOTE</h6>

Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.

Thomas Jefferson

<hr /></section>

<hr /></section>
`}</Markdown>
```

### `size`

Values: `undefined` (default), `breakout`, `narrow`, `float`

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

Überall dieselbe alte Leier. Das Layout ist fertig, der Text lässt auf sich warten. Damit das Layout nun nicht nackt im Raume steht und sich klein und leer vorkommt, springe ich ein: der Blindtext.

<section><h6>QUOTE</h6>

\`\`\`
{"size": "breakout"}
\`\`\`

Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.

Thomas Jefferson

<hr /></section>

Genau zu diesem Zwecke erschaffen, immer im Schatten meines großen Bruders «Lorem Ipsum», freue ich mich jedes Mal, wenn Sie ein paar Zeilen lesen. Denn esse est percipi - Sein ist wahrgenommen werden.

<hr /></section>
`}</Markdown>
```

### With Figure

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

<section><h6>QUOTE</h6>

<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

_Foto: Laurent Burst_

<hr /></section>

Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.

Thomas Jefferson

<hr /></section>

<hr /></section>
`}</Markdown>
```

## Infobox

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

<section><h6>INFOBOX</h6>

### Trapattoni '98

Es gibt keine deutsche Mannschaft spielt offensiv und die Name offensiv wie Bayern. Letzte Spiel hatten wir in Platz drei Spitzen: Elber, Jancka und dann Zickler. Wir müssen nicht vergessen Zickler.

<hr /></section>

<hr /></section>
`}</Markdown>
```

### `size`

Values: `undefined` (default), `float`, `breakout`

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

<section><h6>INFOBOX</h6>

\`\`\`
{"size": "float"}
\`\`\`

### Trapattoni '98

Es gibt keine deutsche Mannschaft spielt offensiv und die Name offensiv wie Bayern. Letzte Spiel hatten wir in Platz drei Spitzen: Elber, Jancka und dann Zickler. Wir müssen nicht vergessen Zickler.

<hr /></section>

Es reicht eine Seite, die - richtig angelegt - sowohl auf verschiedenen Browsern im Netz funktioniert, aber ebenso gut für den Ausdruck oder die Darstellung auf einem Handy geeignet ist. Wohlgemerkt: Eine Seite für alle Formate.

Was für eine Erleichterung. Standards sparen Zeit bei den Entwicklungskosten und sorgen dafür, dass sich Webseiten später leichter pflegen lassen. Natürlich nur dann, wenn sich alle an diese Standards halten.

<hr /></section>
`}</Markdown>
```

### With Figure

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

<section><h6>INFOBOX</h6>

### Trapattoni '98

<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

_Foto: Laurent Burst_

<hr /></section>

Es gibt keine deutsche Mannschaft spielt offensiv und die Name offensiv wie Bayern. Letzte Spiel hatten wir in Platz drei Spitzen: Elber, Jancka und dann Zickler. Wir müssen nicht vergessen Zickler.

<hr /></section>

<hr /></section>
`}</Markdown>
```

#### `figureSize`

Values: `XS`, `S` (default), `M`, `L`

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

<section><h6>INFOBOX</h6>

\`\`\`
{"figureSize": "M"}
\`\`\`

### Trapattoni '98

<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

_Foto: Laurent Burst_

<hr /></section>

Es gibt keine deutsche Mannschaft spielt offensiv und die Name offensiv wie Bayern. Letzte Spiel hatten wir in Platz drei Spitzen: Elber, Jancka und dann Zickler. Wir müssen nicht vergessen Zickler.

<hr /></section>

<hr /></section>
`}</Markdown>
```

#### `figureFloat`

Values: `falsy` (default), `true`

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

<section><h6>INFOBOX</h6>

\`\`\`
{"figureFloat": true}
\`\`\`

### Trapattoni '98

<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

_Foto: Laurent Burst_

<hr /></section>

Es gibt keine deutsche Mannschaft spielt offensiv und die Name offensiv wie Bayern. Letzte Spiel hatten wir in Platz drei Spitzen: Elber, Jancka und dann Zickler. Wir müssen nicht vergessen Zickler.

Zickler ist eine Spitzen mehr, Mehmet eh mehr Basler. Ist klar diese Wörter, ist möglich verstehen, was ich hab gesagt? Danke. Offensiv, offensiv ist wie machen wir in Platz.

Zweitens: ich habe erklärt mit diese zwei Spieler: nach Dortmund brauchen vielleicht Halbzeit Pause. Ich habe auch andere Mannschaften gesehen in Europa nach diese Mittwoch. Ich habe gesehen auch zwei Tage die Training. Ein Trainer ist nicht ein Idiot!

<hr /></section>

<hr /></section>
`}</Markdown>
```

## Tweet

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

<section><h6>EMBEDTWITTER</h6>

\`\`\`
{
  "userScreenName": "RepublikMagazin",
  "__typename": "TwitterEmbed",
  "userId": "786282996223598592",
  "html": "90 Minuten. Und nur noch 300 Unterstützerinnen und Unterstützer fehlen!",
  "userProfileImageUrl": "https://pbs.twimg.com/profile_images/851190311267307521/W2kHAHvv_normal.jpg",
  "userName": "Republik",
  "id": "869954605337243648",
  "createdAt": "Wed May 31 16:31:55 +0000 2017",
  "image": "/static/landscape.jpg"
}
\`\`\`

<https://twitter.com/RepublikMagazin/status/869954605337243648>

<hr /></section>

<hr /></section>
`}</Markdown>
```

## Video embeds

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

<section><h6>EMBEDVIDEO</h6>

\`\`\`
{
  "userUrl": "https://www.youtube.com/channel/UC82dvTzW_mXuQtw3lIYYCZg",
  "__typename": "YoutubeEmbed",
  "thumbnail": "https://i.ytimg.com/vi/t0nfMr_wXVY/maxresdefault.jpg",
  "userProfileImageUrl": "https://yt3.ggpht.com/-ioa9x6qF4KU/AAAAAAAAAAI/AAAAAAAAAAA/f0ivHR9UWTA/s88-c-k-no-mo-rj-c0xffffff/photo.jpg",
  "platform": "youtube",
  "userName": "Republik",
  "title": "Republik: Das Team stellt sich vor",
  "id": "t0nfMr_wXVY",
  "createdAt": "2017-04-26T04:51:29.000Z",
  "retrievedAt": "2017-12-04T16:15:33.260Z",
  "aspectRatio": 1.7761989342806395
}
\`\`\`

<https://www.youtube.com/watch?v=t0nfMr_wXVY>

<hr /></section>

<hr /></section>
`}</Markdown>
```

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

<section><h6>EMBEDVIDEO</h6>

\`\`\`
{
  "userUrl": "https://vimeo.com/republikmagazin",
  "__typename": "VimeoEmbed",
  "thumbnail": "https://i.vimeocdn.com/video/632002647_960x960.jpg?r=pad",
  "userProfileImageUrl": "https://i.vimeocdn.com/portrait/19083661_100x100",
  "platform": "vimeo",
  "userName": "Republik",
  "title": "Viktor Giacobbo unterstützt die Republik",
  "id": "214306781",
  "createdAt": "2017-04-22T16:06:44.000Z",
  "retrievedAt": "2017-12-04T16:25:57.671Z",
  "aspectRatio": 1
}
\`\`\`

<https://vimeo.com/214306781>

<hr /></section>

<hr /></section>
`}</Markdown>
```

## Video player

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

<section><h6>EMBEDVIDEO</h6>

\`\`\`
{
  "size": "narrow",
  "userUrl": "https://vimeo.com/republikmagazin",
  "src": {
    "mp4": "https://player.vimeo.com/external/214306312.hd.mp4?s=55b08b7b1333bff98676842e704950f34fb17da7&profile_id=119&oauth2_token_id=1022641249",
    "hls": "https://player.vimeo.com/external/214306312.m3u8?s=95ba60c75b3eac3da1f6bcccd1ef4f4bc984787a&oauth2_token_id=1022641249",
    "thumbnail": "https://i.vimeocdn.com/video/632164185_960x960.jpg?r=pad",
    "__typename": "VimeoSrc"
  },
  "__typename": "VimeoEmbed",
  "thumbnail": "https://i.vimeocdn.com/video/632164185_960x960.jpg?r=pad",
  "userProfileImageUrl": "https://i.vimeocdn.com/portrait/19083661_100x100",
  "platform": "vimeo",
  "aspectRatio": 1,
  "userName": "Republik",
  "title": "Corine Mauch unterstützt die Republik",
  "id": "214306312",
  "createdAt": "2017-04-22T16:00:59.000Z",
  "retrievedAt": "2017-12-15T12:25:21.318Z"
}
\`\`\`

<https://vimeo.com/214306312>

<hr /></section>

<hr /></section>
`}</Markdown>
```
