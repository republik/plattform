```code|lang-jsx
import Link from 'next/link'
import createFrontSchema from '@project-r/styleguide/lib/templates/Front'

const schema = createFrontSchema({
  Link
})
```

`createFrontSchema` take an optional options object with following key:

`Link`, a Next.js like `<Link />` component
This will be wrapped around and links (headlines and credits) and the whole teaser. You should attach an `onClick` handler within, if you wish to do client side routing and or prefetching. The component recieves following props:
- `href` String, target url or path
- `passHref` Boolean, indicates this will eventually end in an a tag and you may overwrite href

`getPath`: `/:slug`

# Example

```react|noSource
<Markdown schema={schema}>{`

<section><h6>TEASER</h6>

\`\`\`
{
  "bgColor": "SandyBrown",
  "byline": "Foto: Thomas Vuillemin",
  "center": false,
  "color": "#fff",
  "kind": "editorial",
  "portrait": true,
  "reverse": false,
  "teaserType": "frontImage",
  "textPosition": "bottomleft",
  "titleSize": "standard",
  "url": "https://www.republik.ch/manifest"
}
\`\`\`

![](/static/desert.jpg?size=4323x2962)

###### Wüst(e)

# Welt-Bilder

## Premiere im Rothaus

#### Und es war ihnen wie eine Bestätigung ihrer neuen Träume und guten Absichten.

Foto: [Thomas Vuillemin on Unsplash](https://unsplash.com/photos/c1_K8Qfd_iQ)

<hr /></section>

<section><h6>TEASERGROUP</h6>

\`\`\`
{
  "columns": 2
}
\`\`\`

<section><h6>TEASER</h6>

\`\`\`
{
  "bgColor": "#000",
  "byline": "Foto: Laurent Burst",
  "center": false,
  "color": "#fff",
  "kind": "editorial",
  "portrait": true,
  "reverse": false,
  "teaserType": "frontTile",
  "textPosition": "topleft",
  "titleSize": "standard",
  "url": "https://www.republik.ch/updates/portraets"
}
\`\`\`

![](https://assets.republik.ch/images/pierre_rom.jpeg?size=853x853)

###### Echte Republikaner

# Pierre

#### Republik-Verleger, 93 Jahre

Von [Laurent Burst](/~349ef65b-119a-4d3e-9176-26517855d342 "Laurent Burst")

<hr /></section>

<section><h6>TEASER</h6>

\`\`\`
{
  "bgColor": "#ffffff",
  "byline": "Foto: Laurent Burst",
  "center": false,
  "color": "#000000",
  "kind": "editorial",
  "portrait": true,
  "reverse": false,
  "teaserType": "frontTile",
  "textPosition": "topleft",
  "titleSize": "standard",
  "url": "https://www.republik.ch/updates/portraets"
}
\`\`\`

![](https://assets.republik.ch/images/mavie.jpeg?size=848x848)

###### Echte Republikaner

# Mavie

## Premiere im Rothaus

#### Republik-Verlegerin, 8 Monate

Von [Laurent Burst](/~349ef65b-119a-4d3e-9176-26517855d342 "Laurent Burst")

<hr /></section>

<hr /></section>

<section><h6>TEASER</h6>

\`\`\`
{
  "bgColor": "#da4343",
  "byline": "Foto: Laurent Burst",
  "center": false,
  "color": "#fff",
  "kind": "editorial",
  "portrait": true,
  "reverse": false,
  "teaserType": "frontTypo",
  "textPosition": "topleft",
  "titleSize": "standard",
  "url": "https://www.republik.ch/community?id=32464aa8-ccce-4ffa-9b84-0b113aff32f0"
}
\`\`\`

######

# Das schwere Los mit Eltern

#### Wenn sie sonntags überraschend kommen – was tun?

Von Sonderkorrespondent [Lukas Bünger](<>)

<hr /></section>

<section><h6>TEASER</h6>

\`\`\`
{
  "bgColor": "#000",
  "byline": "Foto: Laurent Burst",
  "center": false,
  "color": "#fff",
  "kind": "editorial",
  "portrait": false,
  "reverse": false,
  "teaserType": "frontSplit",
  "textPosition": "topleft",
  "titleSize": "small",
  "url": "https://www.republik.ch/crew"
}
\`\`\`

![](https://assets.republik.ch/cf_gui/static/team/christof_moser.jpg?size=1000x563)

###### Kluge Gedanken von alten Männern

# «With rebellion, awareness is born.»

####

Von [Christof Moser](/~6556e282-4ac4-4129-8f8f-d20f28170c39 "Christof Moser")

<hr /></section>

<section><h6>TEASER</h6>

\`\`\`
{
  "url": null,
  "id": "0eJJ9PrMZ",
  "outline": "#D7D7D7",
  "teaserType": "carousel"
}
\`\`\`

## Durch die Woche

<section><h6>TEASERGROUP</h6>

<section><h6>TEASER</h6>

\`\`\`
{
  "reverse": false,
  "color": null,
  "teaserType": "articleTile",
  "byline": null,
  "formatColor": "#08809a",
  "onlyImage": false,
  "url": "https://github.com/republik/article-wdwww-37?autoSlug",
  "kind": "editorial",
  "center": false,
  "textPosition": "topleft",
  "formatUrl": "https://github.com/republik/format-was-diese-woche-wichtig-war?autoSlug",
  "titleSize": "standard",
  "id": "jOf1niuibE",
  "portrait": true,
  "showImage": true
}
\`\`\`

![](https://cdn.repub.ch/github/republik/mag-20-playground/images/0e2664aaa948430dfb25005c829fd28eb8c382e5.png?size=1181x1181)

###### Was diese Woche wichtig war

# Kein Frieden in Afghanistan, Hoffnung für Flüchtlings­schiffe – und Unheil für Uber

## 

#### Das Nachrichtenbriefing aus der Republik-Redaktion.

13.09.2019

<hr /></section>

<section><h6>TEASER</h6>

\`\`\`
{
  "reverse": false,
  "color": null,
  "teaserType": "articleTile",
  "byline": null,
  "formatColor": "#08809a",
  "onlyImage": false,
  "url": "https://github.com/republik/article-briefing-68?autoSlug",
  "kind": "editorial",
  "center": false,
  "textPosition": "topleft",
  "formatUrl": "https://github.com/republik/format-briefing-aus-bern?autoSlug",
  "titleSize": "standard",
  "id": "bg7gbWTCva",
  "portrait": true,
  "showImage": true
}
\`\`\`

![](https://cdn.repub.ch/github/republik/mag-20-playground/images/175fcbe4fcb26c0cdcb31b62d6dae351345c16be.png?size=1181x1181)

###### Briefing aus Bern

# Urlaub für Väter, der privatisierte E-Ausweis – und ein gebrochenes Versprechen

## 

#### Das Wichtigste aus dem Bundeshaus.

12.09.2019

<hr /></section>

<section><h6>TEASER</h6>

\`\`\`
{
  "reverse": false,
  "color": null,
  "teaserType": "articleTile",
  "byline": null,
  "formatColor": "#08809a",
  "onlyImage": false,
  "url": "https://github.com/republik/article-die-dramen-des-alltags?autoSlug",
  "kind": "editorial",
  "center": false,
  "textPosition": "topleft",
  "formatUrl": "https://github.com/republik/format-am-gericht?autoSlug",
  "titleSize": "standard",
  "id": "QI76z3ymJz",
  "portrait": true,
  "showImage": true
}
\`\`\`

![](https://cdn.repub.ch/github/republik/mag-20-playground/images/45b8bb4d600e977e888f996915d34abf9705a524.jpeg?size=284x284)

###### Am Gericht

# Wenn Alltagsdramen vor dem Richter enden

## 

#### Protokoll eines Tages am Bezirksgericht Pfäffikon, Zürich.

11.09.2019

<hr /></section>

<section><h6>TEASER</h6>

\`\`\`
{
  "reverse": false,
  "color": null,
  "teaserType": "articleTile",
  "byline": null,
  "formatColor": "#08809a",
  "onlyImage": false,
  "url": "https://github.com/republik/article-global-population?autoSlug",
  "kind": "editorial",
  "center": false,
  "textPosition": "topleft",
  "formatUrl": "https://github.com/republik/format-auf-langer-sicht?autoSlug",
  "titleSize": "standard",
  "id": "VSTGaxaHr",
  "portrait": true,
  "showImage": true
}
\`\`\`

![](https://cdn.repub.ch/github/republik/mag-20-playground/images/84f90b070563d2bb1289f2728c1794f98b69e5f0.png?size=1357x602)

###### Auf lange Sicht

# Afrika ist die Zukunft

## 

#### Wie zuverlässig lässt sich das Wachstum der Weltbevölkerung berechnen? Blick ins Jahr 2100 – in sieben Charts.

09.09.2019

<hr /></section>

<section><h6>TEASER</h6>

\`\`\`
{
  "reverse": false,
  "color": null,
  "teaserType": "articleTile",
  "byline": null,
  "onlyImage": false,
  "url": "https://github.com/republik/article-wdwww-w36?autoSlug",
  "kind": "editorial",
  "center": false,
  "textPosition": "topleft",
  "formatUrl": "https://github.com/republik/format-was-diese-woche-wichtig-war?autoSlug",
  "titleSize": "standard",
  "id": "WBKAtX91K",
  "portrait": true,
  "showImage": true
}
\`\`\`

![](https://cdn.repub.ch/github/republik/mag-20-playground/images/f6fb1a3c8ae679aa496463e08a82d8bc53f57765.jpeg?size=284x284)

###### Was diese Woche wichtig war

# Immer wieder Brexit, die Weko büsst Kartelle und – Cum-Ex vor Gericht

## 

#### Das Nachrichtenbriefing aus der Republik-Redaktion.

06.09.2019

<hr /></section>

<hr /></section>

<hr /></section>

<section><h6>TEASERGROUP</h6>

\`\`\`
{
  "columns": 1
}
\`\`\`

<section><h6>TEASER</h6>

\`\`\`
{
  "bgColor": "#000",
  "center": false,
  "color": "#000",
  "kind": "editorial",
  "portrait": true,
  "reverse": false,
  "teaserType": "frontTile",
  "textPosition": "topleft",
  "titleSize": "standard",
  "url": "https://www.republik.ch/updates/portraets",
  "onlyImage": true
}
\`\`\`

![](/static/video.jpg?size=4332x2437)

###### Echte Republikaner

# Mavie

#### Republik-Verlegerin, 8 Monate

Foto: [Laurent Burst](/~349ef65b-119a-4d3e-9176-26517855d342 "Laurent Burst")

<hr /></section>

<hr /></section>

<section><h6>TEASERGROUP</h6>

\`\`\`
{
  "columns": 3
}
\`\`\`

<section><h6>TEASER</h6>

\`\`\`
{
  "bgColor": "#eee",
  "center": false,
  "color": "#000",
  "kind": "scribble",
  "portrait": true,
  "reverse": false,
  "teaserType": "frontTile",
  "textPosition": "topleft",
  "titleSize": "standard",
  "url": "https://www.republik.ch/updates/portraets"
}
\`\`\`

###### Staatentheorie

# Ist der Ameisenstaat eine Republik?

[Daniel Binswanger](/~dbinswanger "Constantin Seibt"), 30. August 2018

<hr /></section>

<section><h6>TEASER</h6>

\`\`\`
{
  "bgColor": "#fff",
  "center": false,
  "color": "#000",
  "kind": "scribble",
  "portrait": true,
  "reverse": false,
  "teaserType": "frontTile",
  "textPosition": "topleft",
  "titleSize": "standard",
  "url": "https://www.republik.ch/updates/portraets"
}
\`\`\`

###### Die aktuelle Verkehrslage

# An der Brücke entspringt eine Ameisenstrasse

[Constantin Seibt](/~cseibt "Constantin Seibt"), 31. August 2018

<hr /></section>

<section><h6>TEASER</h6>

\`\`\`
{
  "bgColor": "#eee",
  "center": false,
  "color": "#000",
  "kind": "scribble",
  "portrait": true,
  "reverse": false,
  "teaserType": "frontTile",
  "textPosition": "topleft",
  "titleSize": "standard",
  "url": "https://www.republik.ch/updates/portraets"
}
\`\`\`

###### Im Gleichmarsch

# Links, zwo, drei, vier!

[Constantin Seibt](/~cseibt "Constantin Seibt"), 1. September 2018

<hr /></section>

<hr /></section>

`}</Markdown>
```
