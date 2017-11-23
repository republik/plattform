# Alle Elemente in der Standard Version

```react|noSource
<Markdown schema={schema}>{`

<section><h6>TITLE</h6>

# Gregor Samsa eines Morgens aus unruhigen Träumen

Jemand musste Josef K. verleumdet haben, denn ohne dass er etwas Böses getan hätte, wurde er eines Morgens verhaftet. «Wie ein Hund!» sagte er, es war, als sollte die Scham ihn überleben.

Von [Franz Kafka](<>) (Text) und [Everett Collection](<>) (Bilder), 13. Juli 2017

<hr /></section>

<section><h6>CENTER</h6>

Und es war ihnen wie eine Bestätigung ihrer neuen Träume und guten Absichten, als am Ziele ihrer Fahrt die Tochter als erste sich erhob und ihren jungen Körper dehnte. «Es ist ein eigentümlicher Apparat», sagte der Offizier zu dem Forschungsreisenden und überblickte mit einem gewissermaßen bewundernden Blick den ihm doch wohlbekannten Apparat.

## Wie ein Hund!

In den letzten Jahrzehnten ist das Interesse an Hungerkünstlern sehr zurückgegangen.

<section><h6>FIGURE</h6>

![](https://assets.project-r.construction/images/nl7-frankenstein.jpg)

Etwas Böses _Foto: Everett Collection/Keystone_

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

![](https://assets.project-r.construction/images/nl7-frankenstein.jpg)

Etwas Böses _Foto: Everett Collection/Keystone_

<hr /></section>

<hr /></section>
`}</Markdown>
```

### Edge-to-Edge

Simpy unwrap from center

```react|noSource
<Markdown schema={schema}>{`
<section><h6>FIGURE</h6>

![](https://assets.project-r.construction/images/nl7-frankenstein.jpg)

Etwas Böses _Foto: Everett Collection/Keystone_

<hr /></section>
`}</Markdown>
```

### Breakout

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

Überall dieselbe alte Leier. Das Layout ist fertig, der Text lässt auf sich warten. Damit das Layout nun nicht nackt im Raume steht und sich klein und leer vorkommt, springe ich ein: der Blindtext.

<section><h6>FIGURE</h6>

\`\`\`
{"size": "breakout"}
\`\`\`

![](https://assets.project-r.construction/images/nl7-frankenstein.jpg)

Etwas Böses _Foto: Everett Collection/Keystone_

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

![](https://assets.project-r.construction/images/nl7-frankenstein.jpg)

<hr /></section>

<section><h6>FIGURE</h6>

![](https://assets.project-r.construction/images/nl7-frankenstein.jpg)

<hr /></section>

This is a caption stretching beautifully across the group of all images as you can see above. _Foto: Everett Collection/Keystone_

<hr /></section>

<hr /></section>
`}</Markdown>
```

#### `columns: 3`

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

Überall dieselbe alte Leier. Das Layout ist fertig, der Text lässt auf sich warten. Damit das Layout nun nicht nackt im Raume steht und sich klein und leer vorkommt, springe ich ein: der Blindtext.

<section><h6>FIGUREGROUP</h6>

\`\`\`
{"columns": 3}
\`\`\`

<section><h6>FIGURE</h6>

![](https://assets.project-r.construction/images/nl7-frankenstein.jpg)

Ein Monster

<hr /></section>

<section><h6>FIGURE</h6>

![](https://assets.project-r.construction/images/nl7-frankenstein.jpg)

Wirklich

<hr /></section>

<section><h6>FIGURE</h6>

![](https://assets.project-r.construction/images/nl7-frankenstein.jpg)

MONSTER!

<hr /></section>

_Foto: Everett Collection/Keystone_

<hr /></section>

Was für eine Erleichterung. Standards sparen Zeit bei den Entwicklungskosten und sorgen dafür, dass sich Webseiten später leichter pflegen lassen. Natürlich nur dann, wenn sich alle an diese Standards halten.

<hr /></section>
`}</Markdown>
```

#### `columns: 4`

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

<section><h6>FIGUREGROUP</h6>

\`\`\`
{"columns": 4}
\`\`\`

<section><h6>FIGURE</h6>

![](https://assets.project-r.construction/images/nl7-frankenstein.jpg)

<hr /></section>

<section><h6>FIGURE</h6>

![](https://assets.project-r.construction/images/nl7-frankenstein.jpg)

<hr /></section>

<section><h6>FIGURE</h6>

![](https://assets.project-r.construction/images/nl7-frankenstein.jpg)

<hr /></section>

<section><h6>FIGURE</h6>

![](https://assets.project-r.construction/images/nl7-frankenstein.jpg)

<hr /></section>

_Foto: Everett Collection/Keystone_

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

#### `breakout`

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

#### `narrow`

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

<section><h6>QUOTE</h6>

\`\`\`
{"size": "narrow"}
\`\`\`

Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.

Thomas Jefferson

<hr /></section>

<hr /></section>
`}</Markdown>
```

#### `float`

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

Überall dieselbe alte Leier. Das Layout ist fertig, der Text lässt auf sich warten. Damit das Layout nun nicht nackt im Raume steht und sich klein und leer vorkommt, springe ich ein: der Blindtext.

<section><h6>QUOTE</h6>

\`\`\`
{"size": "float"}
\`\`\`

Ich bin sicher, eine kleine Rebellion hie und da ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.

Thomas Jefferson

<hr /></section>

Genau zu diesem Zwecke erschaffen, immer im Schatten meines großen Bruders «Lorem Ipsum», freue ich mich jedes Mal, wenn Sie ein paar Zeilen lesen. Denn esse est percipi - Sein ist wahrgenommen werden.

Und weil Sie nun schon die Güte haben, mich ein paar weitere Sätze lang zu begleiten, möchte ich diese Gelegenheit nutzen, Ihnen nicht nur als Lückenfüller zu dienen, sondern auf etwas hinzuweisen, das es ebenso verdient wahrgenommen zu werden: Webstandards nämlich. Sehen Sie, Webstandards sind das Regelwerk, auf dem Webseiten aufbauen. So gibt es Regeln für HTML, CSS, JavaScript oder auch XML; Worte, die Sie vielleicht schon einmal von Ihrem Entwickler gehört haben.

<hr /></section>

`}</Markdown>
```

### With Figure

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

<section><h6>QUOTE</h6>

<section><h6>FIGURE</h6>

![](https://assets.project-r.construction/images/nl7-frankenstein.jpg)

_Foto: Everett Collection/Keystone_

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

#### `float`

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

#### `breakout`

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

Das gilt für Browser wie Firefox, Opera, Safari und den Internet Explorer ebenso wie für die Darstellung in Handys. Und was können Sie für Standards tun? Fordern Sie von Ihren Designern und Programmieren einfach standardkonforme Webseiten.

<section><h6>INFOBOX</h6>

\`\`\`
{"size": "breakout"}
\`\`\`

### Trapattoni '98

Es gibt keine deutsche Mannschaft spielt offensiv und die Name offensiv wie Bayern. Letzte Spiel hatten wir in Platz drei Spitzen: Elber, Jancka und dann Zickler. Wir müssen nicht vergessen Zickler.

<hr /></section>

Ihr Budget wird es Ihnen auf Dauer danken. Ebenso möchte ich Ihnen dafür danken, dass Sie mich bin zum Ende gelesen haben. Meine Mission ist erfüllt. Ich werde hier noch die Stellung halten, bis der geplante Text eintrifft. Ich wünsche Ihnen noch einen schönen Tag.

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

![](https://assets.project-r.construction/images/nl7-frankenstein.jpg)

_Foto: Everett Collection/Keystone_

<hr /></section>

Es gibt keine deutsche Mannschaft spielt offensiv und die Name offensiv wie Bayern. Letzte Spiel hatten wir in Platz drei Spitzen: Elber, Jancka und dann Zickler. Wir müssen nicht vergessen Zickler.

<hr /></section>

<hr /></section>
`}</Markdown>
```

#### `imageSize`

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

<section><h6>INFOBOX</h6>

\`\`\`
{"imageSize": "M"}
\`\`\`

### Trapattoni '98

<section><h6>FIGURE</h6>

![](https://assets.project-r.construction/images/nl7-frankenstein.jpg)

_Foto: Everett Collection/Keystone_

<hr /></section>

Es gibt keine deutsche Mannschaft spielt offensiv und die Name offensiv wie Bayern. Letzte Spiel hatten wir in Platz drei Spitzen: Elber, Jancka und dann Zickler. Wir müssen nicht vergessen Zickler.

<hr /></section>

<hr /></section>
`}</Markdown>
```


#### `imageFloat`

```react|noSource
<Markdown schema={schema}>{`
<section><h6>CENTER</h6>

<section><h6>INFOBOX</h6>

\`\`\`
{"imageFloat": true}
\`\`\`

### Trapattoni '98

<section><h6>FIGURE</h6>

![](https://assets.project-r.construction/images/nl7-frankenstein.jpg)

_Foto: Everett Collection/Keystone_

<hr /></section>

Es gibt keine deutsche Mannschaft spielt offensiv und die Name offensiv wie Bayern. Letzte Spiel hatten wir in Platz drei Spitzen: Elber, Jancka und dann Zickler. Wir müssen nicht vergessen Zickler.

Zickler ist eine Spitzen mehr, Mehmet eh mehr Basler. Ist klar diese Wörter, ist möglich verstehen, was ich hab gesagt? Danke. Offensiv, offensiv ist wie machen wir in Platz.

Zweitens: ich habe erklärt mit diese zwei Spieler: nach Dortmund brauchen vielleicht Halbzeit Pause. Ich habe auch andere Mannschaften gesehen in Europa nach diese Mittwoch. Ich habe gesehen auch zwei Tage die Training. Ein Trainer ist nicht ein Idiot!

<hr /></section>

<hr /></section>
`}</Markdown>
```