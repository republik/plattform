```code|lang-jsx
import schema from '@project-r/styleguide/lib/templates/Front'
```

# Example

```react|noSource
<Markdown schema={schema}>{`

<section><h6>TEASER</h6>

\`\`\`
{
  "bgColor": "SandyBrown",
  "center": false,
  "color": "#fff",
  "kind": "editorial",
  "linkColor": "WhiteSmoke",
  "portrait": true,
  "reverse": false,
  "teaserType": "frontImage",
  "textPosition": "bottomleft",
  "titleSize": "standard",
  "url": null
}
\`\`\`

![](/static/desert.jpg?size=4323x2962)

###### Wüst(e)

# Welt-Bilder

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
  "center": false,
  "color": "#fff",
  "kind": "editorial",
  "linkColor": "#fff",
  "portrait": true,
  "reverse": false,
  "teaserType": "frontTile",
  "textPosition": "topleft",
  "titleSize": "standard",
  "url": "https://republik.love/2017/12/01/mehr-salz"
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
  "bgColor": "#ffffff",
  "center": false,
  "color": "#000000",
  "kind": "editorial",
  "linkColor": "#000",
  "portrait": true,
  "reverse": false,
  "teaserType": "frontTile",
  "textPosition": "topleft",
  "titleSize": "standard",
  "url": "https://republik.love/2017/12/01/alles-wird-gut"
}
\`\`\`

![](https://assets.republik.ch/images/mavie.jpeg?size=848x848)

###### Echte Republikaner

# Mavie

#### Republik-Verlegerin, 8 Monate

Foto: [Laurent Burst](/~349ef65b-119a-4d3e-9176-26517855d342 "Laurent Burst")

<hr /></section>

<hr /></section>

<section><h6>TEASER</h6>

\`\`\`
{
  "bgColor": "#da4343",
  "center": false,
  "color": "#fff",
  "kind": "editorial",
  "linkColor": "#fff",
  "portrait": true,
  "reverse": false,
  "teaserType": "frontTypo",
  "textPosition": "topleft",
  "titleSize": "standard",
  "url": null
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
  "center": false,
  "color": "#fff",
  "kind": "editorial",
  "linkColor": "gray",
  "portrait": true,
  "reverse": false,
  "teaserType": "frontSplit",
  "textPosition": "topleft",
  "titleSize": "small",
  "url": "https://republik.love/2017/12/04/republik-stand-der-arbeit-stand-des-irrtums"
}
\`\`\`

![](https://assets.republik.ch/cf_gui/static/team/christof_moser.jpg)

###### Kluge Gedanken von alten Männern

# «With rebellion, awareness is born.»

#### 

Von [Christof Moser](/~6556e282-4ac4-4129-8f8f-d20f28170c39 "Christof Moser")

<hr /></section>

`}</Markdown>
```
