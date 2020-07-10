```code|lang-jsx
import createArticleSchema from '@project-r/styleguide/lib/templates/Article'

const schema = createArticleSchema({
  titleMargin: false
})
```

`createArticleSchema` take an optional options object with following keys:

- `repoPrefix`, a prefix for publikator repo creation
- `documentEditorOptions`, forward options to the document editor module
- `customMetaFields`, passed to `customFields` of the `meta` module. Default to repo refs for discussion, format and dossier.
- `series`, allow to form series via meta data
- `darkMode`, allow to set the article in dark mode
- `titleBlockPrepend`, prepend React elements—e.g. a dossier tag—to the title block
- `titleBlockRule`, overwrite the whole title block, prepend and append are no longer applied
- `titleMargin`, automatically adds some margin below the title, default `true`
- `getPath`, the function to transform meta data to a path, default `/YYYY/MM/DD/:slug`
- `t`, optional translation function, used for e.g. DNT notes
- `dynamicComponentRequire`, optional custom require function for dynamic components
- `Link`, a Next.js like `<Link />` component
  This will be wrapped around links. You should attach an `onClick` handler within, if you wish to do client side routing and or prefetching. The component recieves following props:
  - `href` String, target url or path
  - `passHref` Boolean, indicates this will eventually end in an a tag and you may overwrite href
- `getVideoPlayerProps`, a [prop getter](https://blog.kentcdodds.com/how-to-give-rendering-control-to-users-with-prop-getters-549eaef76acf) for the video player. Make sure to forward, modified or unmodified, the props that are passed to the function.
- `metaBody`, use the meta font for body text

# Example

```react|noSource
<Markdown schema={schema}>{`

<section><h6>TITLE</h6>

# Gregor Samsa eines Morgens aus unruhigen Träumen

Jemand musste Josef K. verleumdet haben, denn ohne dass er etwas Böses getan hätte, wurde er eines Morgens verhaftet. «Wie ein Hund!» sagte er, es war, als sollte die Scham ihn überleben.

Von [Franz Kafka](<>) (Text) und [Laurent Burst](<>) (Bilder), 13. Juli 2017

<hr /></section>

<section><h6>CENTER</h6>

Und es war ihnen wie eine **Bestätigung** ihrer _neuen Träume_ und _guten Absichten_, als am **Ziele** ihrer Fahrt die Tochter als erste sich erhob und ihren jungen Körper dehnte. «Es ist ein eigentümlicher Apparat», sagte der Offizier zu dem Forschungsreisenden und überblickte mit einem gewissermaßen bewundernden Blick den ihm doch wohlbekannten Apparat.

<section><h6>BUTTON</h6>

\`\`\`
{"primary": true}
\`\`\`

[NO<sub>x</sub> tötet](#nox-an-der-langstrasse "Zur Sektion springen")

<hr /></section>

<section><h6>BUTTON</h6>

[Ignorieren](/devnull "Ins nichts")

<hr /></section>

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

## NO<sub>x</sub> an der Langstrasse

<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

Etwas Böses _Foto: Laurent Burst_

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

```react|noSource
<Markdown schema={schema}>{`
<section><h6>TITLE</h6>

# Gregor Samsa eines Morgens aus unruhigen Träumen

## Kafkas «Verwandlung»

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

Simply unwrap from center

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

## Charts

```react|noSource
<Markdown schema={schema}>{`

<section><h6>CENTER</h6>

Zwei flinke Boxer jagen die quirlige Eva und ihren Mops durch Sylt. Franz jagt im komplett verwahrlosten Taxi quer durch Bayern.

<section><h6>CHART</h6>

\`\`\`
{
  "type": "Bar",
  "numberFormat": ".0%",
  "y": "country",
  "category": "datum.country == 'Schweiz' ? '1' : '0'"
}
\`\`\`

### Abgabenquote im internationalen Vergleich

in Prozent des BIP 2015

\`\`\`csv
country,value
Frankreich,0.455
Österreich,0.435
Italien,0.433
Deutschland,0.369
Schweiz,0.279
USA,0.264
Irland,0.236
\`\`\`

Quelle: OECD 2015. Revenue Statistics 1965-2014. Bundesministerium der Finanzen 2016. Die wichtigsten Steuern im internationalen Vergleich 2015.

<hr /></section>

Zwölf Boxkämpfer jagen Viktor quer über den großen Sylter Deich. Vogel Quax zwickt Johnys Pferd Bim.

<hr /></section>

`}</Markdown>
```

### `size`

Values: `undefined` (default), `breakout`, `narrow`, `float`

```react|noSource
<Markdown schema={schema}>{`

<section><h6>CENTER</h6>

Zwei flinke Boxer jagen die quirlige Eva und ihren Mops durch Sylt. Franz jagt im komplett verwahrlosten Taxi quer durch Bayern.

<section><h6>CHART</h6>

\`\`\`
{
  "type": "Bar",
  "size": "float",
  "numberFormat": "%",
  "y": "category",
  "color": "concern",
  "colorRange": "diverging2",
  "colorLegend": true,
  "domain": [0, 1],
  "sort": "none",
  "colorSort": "none",
  "highlight": "datum.category == 'Allgemein'"
}
\`\`\`

### Kriminalitätsfurcht 2012

\`\`\`csv
category,concern,value
Allgemein,gar nicht,0.416
Allgemein,etwas,0.413
Allgemein,ziemlich,0.124
Allgemein,sehr stark,0.047
\`\`\`

Quelle: Deutscher Viktimisierungssurvey 2012.

<hr /></section>

Zwölf Boxkämpfer jagen Viktor quer über den großen Sylter Deich. Vogel Quax zwickt Johnys Pferd Bim.

Sylvia wagt quick den Jux bei Pforzheim. Polyfon zwitschernd aßen Mäxchens Vögel Rüben, Joghurt und Quark. "Fix, Schwyz! " quäkt Jürgen blöd vom Paß. Victor jagt zwölf Boxkämpfer quer über den großen Sylter Deich.

Falsches Üben von Xylophonmusik quält jeden größeren Zwerg. Heizölrückstoßabdämpfung. Zwei flinke Boxer jagen die quirlige Eva und ihren Mops durch Sylt. Franz jagt im komplett verwahrlosten Taxi quer durch Bayern.

<hr /></section>

`}</Markdown>
```

## Block Quote

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

<section><h6>BLOCKQUOTE</h6>

> «\\[...] er kam mir nach und sagte: ‹Was guckst du mich denn so entgeistert an, mein Blümelein -- ich schlage vor, daß wir jetzt erst einmal bumsen.› Nun, inzwischen war ich bei meiner Handtasche, und er ging mir an die Kledage, und ich dachte: ‹Bumsen, meinetwegen›, und ich hab' die Pistole rausgenommen und sofort auf ihn geschossen \\[...] und ich dachte: Gut, jetzt bumst's. \\[...] Ohne Reue, ohne Bedauern. Er wollte doch bumsen, und ich habe gebumst, oder?»

Heinrich Böll *«Die verlorene Ehre der Katharina Blum», Schlusskapitel 58. Vorabdruck im [SPIEGEL 19. August 1974](http://www.spiegel.de/spiegel/print/d-41651533.html)*

<hr /></section>

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

### Pull Quote with Figure

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

### Infobox with Figure

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

### Infobox with List

And `collapsable`.

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

<section><h6>INFOBOX</h6>

\`\`\`
{"collapsable": true}
\`\`\`


### Boxentitel

#### Boxenzwischentitel

- Jemand mußte Josef K. verleumdet haben, denn ohne daß er etwas Böses getan hätte, wurde er eines Morgens verhaftet.
- Die Köchin der Frau Grubach, seiner Zimmervermieterin, die ihm jeden Tag gegen acht Uhr früh das Frühstück brachte, kam diesmal nicht.
- Das war noch niemals geschehen. K. wartete noch ein Weilchen, sah von seinem Kopfkissen aus die alte Frau, die ihm gegenüber wohnte und die ihn mit einer an ihr ganz ungewöhnlichen Neugierde beobachtete, dann aber, gleichzeitig befremdet und hungrig, läutete er.

#### Boxenzwischentitel

1. Sofort klopfte es und ein Mann, den er in dieser Wohnung noch niemals gesehen hatte, trat ein.
2. Er war schlank und doch fest gebaut, er trug ein anliegendes schwarzes Kleid, das, ähnlich den Reiseanzügen, mit verschiedenen Falten, Taschen, Schnallen, Knöpfen und einem Gürtel versehen war.
3. Und infolgedessen, ohne daß man sich darüber klar wurde, wozu es dienen sollte, besonders praktisch erschien.

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
  "userProfileImageUrl": "/static/twitter_icon.jpg",
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

## Video using audio player

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

<section><h6>EMBEDVIDEO</h6>

\`\`\`
{
  "forceAudio": true,
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

## Dynamic Components

By default dynamic components are wrapped in figures to support all center sizes. Set `raw` to `true` to disable figure wrapping, `size` will have no effect in raw mode.

### `size`

Values: `undefined` (default), `breakout`, `narrow`, `floatTiny`

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

Genau zu diesem Zwecke erschaffen, immer im Schatten meines großen Bruders «Lorem Ipsum», freue ich mich jedes Mal, wenn Sie ein paar Zeilen lesen.

<section><h6>DYNAMIC_COMPONENT</h6>

\`\`\`
{
  "size": "narrow",
  "src": "/static/dynamic_hello.js",
  "props": {
    "text": "This is narrow."
  }
}
\`\`\`

\`\`\`html
<div>Optional static SSR version and placeholder while loading. Default is a loader.</div>
\`\`\`

<hr /></section>

Denn esse est percipi - Sein ist wahrgenommen werden.

<hr /></section>
`}</Markdown>
```

### Edge-to-Edge

Simply unwrap from center

```react|noSource
<Markdown schema={schema}>{`

<section><h6>CENTER</h6>

Überall dieselbe alte Leier. Das Layout ist fertig, der Text lässt auf sich warten.

<hr /></section>

<section><h6>DYNAMIC_COMPONENT</h6>

\`\`\`
{
  "src": "/static/dynamic_hello.js",
  "props": {
    "text": "Edge-To-Edge"
  }
}
\`\`\`

\`\`\`html
<div>Optional static SSR version and placeholder while loading. Default is a loader.</div>
\`\`\`

<hr /></section>

<section><h6>CENTER</h6>

Damit das Layout nun nicht nackt im Raume steht und sich klein und leer vorkommt, springe ich ein: der Blindtext.

<hr /></section>

`}</Markdown>
```

### Article Collection

Note: collections at the end of a document do not get a `progressId` to avoid – they are usually further reading collections that should not count towards the reading progress.

```react|noSource
<Markdown schema={schema}>{`

<section><h6>CENTER</h6>

Überall dieselbe alte Leier. Das Layout ist fertig, der Text lässt auf sich warten.

<section><h6>ARTICLECOLLECTION</h6>

## 

<section><h6>TEASERGROUP</h6>

<section><h6>TEASER</h6>

\`\`\`
{
  "reverse": false,
  "color": "#000",
  "teaserType": "articleTile",
  "byline": null,
  "onlyImage": false,
  "url": "https://github.com/republik/article-klima-ameise?autoSlug",
  "kind": "scribble",
  "center": false,
  "textPosition": "topleft",
  "formatUrl": "https://github.com/republik/format-aus-der-arena?autoSlug",
  "titleSize": "standard",
  "id": "eTcO7Burj",
  "portrait": true,
  "showImage": false,
  "bgColor": "#fff"
}
\`\`\`

###### Aus der Arena

# Unser doppeltes Klimadilemma

## 

#### Weshalb es auch für die kleine Schweiz von grossem Interesse sein sollte, den Klimawandel zu bremsen.

Von [Simon Schmid](/~eca9ee2c-4678-4f63-8564-651293df2b97), 14.11.2018

<hr /></section>

<hr /></section>

<hr /></section>

Damit das Layout nun nicht nackt im Raume steht und sich klein und leer vorkommt, springe ich ein: der Blindtext.

<section><h6>ARTICLECOLLECTION</h6>

## 

<section><h6>TEASERGROUP</h6>

<section><h6>TEASER</h6>

\`\`\`
{
  "reverse": false,
  "color": "#000",
  "teaserType": "articleTile",
  "byline": null,
  "onlyImage": false,
  "url": "https://github.com/republik/article-das-land-wo-die-zitronen-bluehn?autoSlug",
  "kind": "editorial",
  "center": false,
  "textPosition": "topleft",
  "titleSize": "standard",
  "id": "Ziygh9IGiq",
  "portrait": true,
  "showImage": false,
  "bgColor": "#fff"
}
\`\`\`

###### 

# Das Land, wo bald die Zitronen blühn

## 

#### Die Schweiz wird zu einem mediterranen Land. Für die Landwirtschaft ein Glück: Es werden Melonen, Reis und Topweine wachsen. Aber sind die Bauern bereit?

Von [Urs Bruderer](/~7b0d6a74-f57b-4498-8eb7-455936672736) (Text) und Adam Higton (Illustrationen), 07.09.2018

<hr /></section>

<section><h6>TEASER</h6>

\`\`\`
{
  "reverse": false,
  "color": "#000",
  "teaserType": "articleTile",
  "byline": null,
  "onlyImage": false,
  "url": "https://github.com/republik/article-wachstum?autoSlug",
  "kind": "editorial",
  "center": false,
  "textPosition": "topleft",
  "titleSize": "standard",
  "id": "N-pxPtgWla",
  "portrait": true,
  "showImage": false,
  "bgColor": "#fff"
}
\`\`\`

###### Fotobuch

# Wir Übermenschen

## Matthieu Gafsou: «H+»

#### Die Aufnahmen des Lausanners bilden eine skurrile, geheimnisvolle und manchmal unheimliche Wirklichkeit ab.

Von [Barbara Villiger Heilig](/~5f45d6a3-ff52-4e67-9925-92447f43d2e1 "Barbara Villiger Heilig"), 04.09.2018

<hr /></section>

<hr /></section>

<hr /></section>

<hr /></section>

`}</Markdown>
```


### Carousel

```react|noSource
<Markdown schema={schema}>{`

<section><h6>CENTER</h6>

Der Nahe Osten ist eine geographische Bezeichnung, die heute im Allgemeinen für arabische Staaten Vorderasiens und Israel benutzt wird. Insbesondere die Region des Fruchtbaren Halbmondes und die Arabische Halbinsel gehören zum Nahen Osten. Häufig werden außerdem Zypern, die Türkei, Ägypten und der Iran dazugezählt.

<hr /></section>

<section><h6>TEASER</h6>

\`\`\`
{
  "url": null,
  "id": "0eJJ9PrMZ",
  "color": "#fff",
  "bgColor": "SandyBrown",
  "bigger": true,
  "teaserType": "carousel"
}
\`\`\`

## Zwei Menschen

<section><h6>TEASERGROUP</h6>

<section><h6>TEASER</h6>

\`\`\`
{
  "reverse": false,
  "color": null,
  "teaserType": "articleTile",
  "byline": null,
  "onlyImage": false,
  "url": null,
  "kind": "editorial",
  "center": false,
  "textPosition": "topleft",
  "titleSize": "standard",
  "id": "bg7gbWTCva",
  "portrait": true,
  "showImage": true
}
\`\`\`

![](/static/brigitte_meyer.jpg?size=1000x1000)

###### 

# Mara

## 

#### Die weitsichtige Bildchefin

<hr /></section>

<section><h6>TEASER</h6>

\`\`\`
{
  "reverse": false,
  "color": null,
  "teaserType": "articleTile",
  "byline": null,
  "onlyImage": false,
  "url": null,
  "kind": "editorial",
  "center": false,
  "textPosition": "topleft",
  "titleSize": "standard",
  "id": "QI76z3ymJz",
  "portrait": true,
  "showImage": true
}
\`\`\`

![](/static/christof_moser.jpg?size=500x500)

###### 

# Tarek

## 

#### Der bittersüsse Chefredaktor

<hr /></section>

<hr /></section>

<hr /></section>

<section><h6>CENTER</h6>

Reise planen: Flug mit einer Dauer von rund 4 Stunden.

<hr /></section>

`}</Markdown>
```
