A `<TeaserCarousel />` is a row of tiles through which the user can scroll horizontally.

Supported props:
- `color` (string): The text color (default: `#fff`).
- `bgColor` (string): The background color (default: `#000`).
- `outline` (string): The default outline color for cards.
- `bigger` (bool): use bigger style for cards
- `article` (bool): margin and smaller max width for tiles (optimised to align with article column)

Below 4 tiles, each tile will use 33% of the space available, up to a maximum of 450 pixels.

`TeaserCarousel` provides a `React.context` to it's children to propagate `color`, `bgColor`, `outline` and `bigger`. It can be overwritten individually via props.

The media queries are defined in [`FrontTile`](/teaserfronttile).

```react|responsive
<TeaserCarousel outline='#D7D7D7'>
  <TeaserSectionTitle href="/rezensionen" onClick={(e) => {
    e.preventDefault()
  }}>
    Rezensionen
  </TeaserSectionTitle>
  <TeaserCarouselTileContainer>
    <TeaserCarouselTile
      image='/static/carousel/test.png?size=4682x3512'
      onClick={() => console.log("click on first tile")}
    >
      <TeaserCarouselFormat>Poesie & Prosa</TeaserCarouselFormat>
      <TeaserCarouselHeadline.Editorial>Das Rätsel Dag Solstad</TeaserCarouselHeadline.Editorial>
      <TeaserCarouselSubject>
        Dag Solstad: «T. Singer»
      </TeaserCarouselSubject>
      <TeaserCarouselLead>
        Der Norweger gehört zu den schrulligsssen Autoren der Gegenwart.
      </TeaserCarouselLead>
      <Editorial.Credit>
        Von <Editorial.A  color='#000' href='#'>Jan Wilm</Editorial.A >, 05.07.2019
      </Editorial.Credit>

    </TeaserCarouselTile>

    <TeaserCarouselTile
      image='/static/carousel/jackson.png?size=400x216'
      byline='Keystone'
    >
      <TeaserCarouselFormat>Film</TeaserCarouselFormat>
      <TeaserCarouselHeadline.Editorial>Echt jetzt?</TeaserCarouselHeadline.Editorial>
      <TeaserCarouselSubject>
        Peter Jackson: «They Shall Not Grow Old»
      </TeaserCarouselSubject>
      <TeaserCarouselLead>
        Der Blockbuster-Regisseur zeigt den Ersten Weltkrieg.
      </TeaserCarouselLead>
      <Editorial.Credit>
        Von <Editorial.A  color='#000' href='#'>Simon Spiegel</Editorial.A >, 05.07.2019
      </Editorial.Credit>
    </TeaserCarouselTile>

    <TeaserCarouselTile
      image='/static/carousel/vault.png?size=376x214'
    >
      <TeaserCarouselHeadline.Editorial>Tote Sprachen leben länger</TeaserCarouselHeadline.Editorial>
      <TeaserCarouselLead>
        «Heaven’s Vault» ist ein aussergewöhnliches Adventure-Game.
      </TeaserCarouselLead>
      <Editorial.Credit>
        Von <Editorial.A  color='#000' href='#'>Christof Zurschmitten</Editorial.A >, 05.07.2019
      </Editorial.Credit>
    </TeaserCarouselTile>

    <TeaserCarouselTile
      byline='Gene Glover/Agentur Focus'
      image='/static/carousel/rinck.png?size=176x240'
    >
      <TeaserCarouselHeadline.Editorial>Die vier Gangarten von lechts nach Rinck</TeaserCarouselHeadline.Editorial>
      <TeaserCarouselLead>
        Die Essays und Gedichte von Monika Rinck sind das originellste Denkabenteuer.
      </TeaserCarouselLead>
      <Editorial.Credit>
        Von <Editorial.A  color='#000' href='#'>Daniel Graf</Editorial.A >, 05.07.2019
      </Editorial.Credit>
    </TeaserCarouselTile>

    <TeaserCarouselTile
      image='/static/carousel/calle.png?size=332x248'>
      <TeaserCarouselFormat>Kunst</TeaserCarouselFormat>
      <TeaserCarouselHeadline.Editorial>Blindes Sehen</TeaserCarouselHeadline.Editorial>
      <TeaserCarouselSubject>
        Sophie Calle: «Un certain regard»
      </TeaserCarouselSubject>
      <TeaserCarouselLead>
        Das Fotomuseum Winterthur zeigt eine beeindruckende Schau.
      </TeaserCarouselLead>
      <Editorial.Credit>
        Von <Editorial.A  color='#000' href='#'>Daniel Binswanger</Editorial.A >, 05.07.2019
      </Editorial.Credit>
    </TeaserCarouselTile>
  </TeaserCarouselTileContainer>
</TeaserCarousel>
```

```react|span-6
<TeaserCarousel outline='#D7D7D7'>
 <TeaserSectionTitle>Kolumnen</TeaserSectionTitle>
  <TeaserCarouselTileContainer>

    <TeaserCarouselTile image='/static/carousel/binswanger.png?size=2480x2521' onClick={() => console.log("click on first tile")}>
      <TeaserCarouselFormat color='#00B4FF'>
        Binswanger
      </TeaserCarouselFormat>
      <TeaserCarouselHeadline.Editorial>
        «Was verbindet die rechtspopulsistischen Parteien eigentlich?»
      </TeaserCarouselHeadline.Editorial>
      <Editorial.Credit>
        Von <Editorial.A href='#'>Daniel Binswanger</Editorial.A >, 05.07.2019
      </Editorial.Credit>
    </TeaserCarouselTile>

    <TeaserCarouselTile image='/static/carousel/berg.png?size=2480x2963'>
      <TeaserCarouselFormat color="#00B4FF">Sybille Berg</TeaserCarouselFormat>
      <TeaserCarouselHeadline.Editorial>
        «Was führt Männer oft zu fast albern anmutender Selbstüber-schätzung?»
      </TeaserCarouselHeadline.Editorial>
      <Editorial.Credit>
        Von <Editorial.A href='#'>Sybille Berg</Editorial.A >, 05.07.2019
      </Editorial.Credit>
    </TeaserCarouselTile>

    <TeaserCarouselTile image='/static/carousel/niggli.png?size=2422x2480'>
      <TeaserCarouselFormat color="#00B4FF">Niggli</TeaserCarouselFormat>
      <TeaserCarouselHeadline.Editorial>
        Sir Kim Darroch, Ritter der ungeschminkten Wahrheit
      </TeaserCarouselHeadline.Editorial>
      <Editorial.Credit>
        Von <Editorial.A href='#'>Marcel Alexander Niggli</Editorial.A >, 05.07.2019
      </Editorial.Credit>
    </TeaserCarouselTile>

 </TeaserCarouselTileContainer>
</TeaserCarousel>
```

```react|span-6,responsive
<TeaserCarousel bgColor='#000' color='#fff' bigger>
  <TeaserSectionTitle>Serien</TeaserSectionTitle>

  <TeaserCarouselTileContainer>
    <TeaserCarouselTile
      image='/static/carousel/murdoch.png?size=496x372'
      count={12}
      byline='Joan Wong'
    >
    <TeaserCarouselHeadline.Editorial>
      Die Dynastie Murdoch
    </TeaserCarouselHeadline.Editorial>

    </TeaserCarouselTile>
      <TeaserCarouselTile
      image='/static/carousel/homestory.png?size=496x372'
      count={6}
      byline='Doug Chayka'
    >
      <TeaserCarouselHeadline.Editorial>
        Homestory
      </TeaserCarouselHeadline.Editorial>
    </TeaserCarouselTile>

    <TeaserCarouselTile
      image='/static/carousel/eth.png?size=496x372'
      count={8}
    >
      <TeaserCarouselHeadline.Editorial>
        Der Fall ETH
      </TeaserCarouselHeadline.Editorial>
    </TeaserCarouselTile>

    <TeaserCarouselTile
      image='/static/carousel/mike.png?size=496x372'
      count={24}
    >
      <TeaserCarouselHeadline.Editorial>
        «Am Limit»: Die Geschichte von Mike
      </TeaserCarouselHeadline.Editorial>
    </TeaserCarouselTile>

    <TeaserCarouselTile
      image='/static/carousel/strahlen.png?size=496x372'
      count={10}
    >
      <TeaserCarouselHeadline.Editorial>
        Geheimnisvolle Strahlen
      </TeaserCarouselHeadline.Editorial>
    </TeaserCarouselTile>

  </TeaserCarouselTileContainer>
</TeaserCarousel>
```

### `<TeaserCarouselTile />`

A Carousel has `TeaserCarouselTile` as direct children of a `TeaserCarouselTileContainer`. They can also be customized.
Supported props:
- `bigger` (boolean): if `true`, the image will be top aligned and used the full width of the tile.
- `color` (string): The text color (default: `#fff`).
- `bgColor` (string): The background color (default: `#000`).
- `outline` (string): The tile border color.
- `count` (number): if an article `count`is provided, this number will be displayed in an icon below the image.
- `image` (string): image source.
- `byline` (string): image credit.
- `alt` (string): image alternative text.
- `onClick` (function): function executed on click.
- `children`: children components.

```react|span-2
<TeaserCarouselTile
  image='/static/carousel/calle.png?size=332x248'
  outline='#D7D7D7'
>
  <TeaserCarouselFormat>
    Kunst
  </TeaserCarouselFormat>
  <TeaserCarouselHeadline.Editorial>
    Blindes Sehen
  </TeaserCarouselHeadline.Editorial>
  <TeaserCarouselSubject>
    Sophie Calle: «Un certain regard»
  </TeaserCarouselSubject>
  <TeaserCarouselLead>
    Das Fotomuseum Winterthur zeigt eine beeindruckende Schau.
  </TeaserCarouselLead>
  <Editorial.Credit>
    Von <Editorial.A  color='#000' href='#'>Daniel Binswanger</Editorial.A >, 05.07.2019
  </Editorial.Credit>
</TeaserCarouselTile>
```
```react|span-2
<TeaserCarouselTile
  image='/static/carousel/binswanger.png?size=2480x2521'
  outline='#D7D7D7'
  onClick={() => console.log("click on tile")}
>
  <TeaserCarouselFormat
    color='#00B4FF'
  >
    Binswanger
  </TeaserCarouselFormat>
  <TeaserCarouselHeadline.Editorial>
    «Was verbindet die rechtspopulsistischen Parteien eigentlich?»
  </TeaserCarouselHeadline.Editorial>
  <Editorial.Credit>
    Von <Editorial.A href='#'>Daniel Binswanger</Editorial.A >, 05.07.2019
  </Editorial.Credit>
</TeaserCarouselTile>
```
```react|span-2
<TeaserCarouselTile
  bigger
  image='/static/carousel/strahlen.png?size=248x186'
  count={10}
  bgColor='#000'
  color='#fff'
>
  <TeaserCarouselHeadline.Editorial bigger>
    Geheimnisvolle Strahlen
  </TeaserCarouselHeadline.Editorial>
</TeaserCarouselTile>
```

### `<TeaserCarouselHeadline />`
Supported props:
- `bigger` (boolean): if `true`, the font size and line height will be increased. Default: `false`.
- `children`: children components.

Default (font-size: 19px)
`bigger` = `true` (font-size: 28px)

```react|span-2
<TeaserCarouselHeadline.Editorial>
  Das Rätsel Dag Solstad
</TeaserCarouselHeadline.Editorial>
```
```react|span-2
<TeaserCarouselHeadline.Interaction>
  Die Republik vorgelesen
</TeaserCarouselHeadline.Interaction>
```
```react|span-2
<TeaserCarouselHeadline.Scribble>
  Wer Talent hat, darf in die Schweiz migrieren
</TeaserCarouselHeadline.Scribble>
```


```react|span-2
<TeaserCarouselHeadline.Editorial bigger>
  Die Dynastie Murdoch
</TeaserCarouselHeadline.Editorial>
```
```react|span-2
<TeaserCarouselHeadline.Interaction bigger>
  Die Republik vorgelesen
</TeaserCarouselHeadline.Interaction>
```
```react|span-2
<TeaserCarouselHeadline.Scribble bigger>
  Wer Talent hat, darf in die Schweiz migrieren
</TeaserCarouselHeadline.Scribble>
```


### `<TeaserCarouselFormat />`
Supported props:
- `color` (string): if `true`, the font size and line height will be increased. Default: [feuilleton color](/colors).
- `children`: children components.

### `<TeaserCarouselSubject />`, `<TeaserCarouselLead />`

Two styles are available: `TeaserCarouselSubject` (light grey, sans serif), and `TeaserCarouselLead` (`text` color, serif).

```react|span-2
<>
  <TeaserCarouselSubject>
    Sophie Calle: «Un certain regard»
  </TeaserCarouselSubject>
  <TeaserCarouselLead>
    Das Fotomuseum Winterthur zeigt eine beeindruckende Schau.
  </TeaserCarouselLead>
</>
```
```react|span-2
<>
  <TeaserCarouselSubject>
    Peter Jackson: «They Shall Not Grow Old»
  </TeaserCarouselSubject>
  <TeaserCarouselLead>
    Der Blockbuster-Regisseur zeigt den Ersten Weltkrieg.
  </TeaserCarouselLead>
</>
```

### `<TeaserCarouselArticleCount />`
This component is only used when `TeaserCarouselTile`'s prop `count` is set.
Supported props:
- `color` (string): The text color (default: `#000`).
- `bgColor` (string): The background color (default: `#fff`).
- `count` (number): the number to display.

```react|span-2
<div style={{backgroundColor: '#000', width: '300px', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
  <TeaserCarouselArticleCount
    count={12}
    bgColor='#fff'
    color='#000'
  />
</div>
```

```react|span-2
<div style={{backgroundColor: '#fff', width: '300px', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
  <TeaserCarouselArticleCount
    count={9}
    bgColor='#000'
    color='#fff'
  />
</div>
```

### Grid

```react|responsive
<TeaserCarousel bgColor='#000' color='#fff' article grid bigger>
  <TeaserSectionTitle>Serien</TeaserSectionTitle>

  <TeaserCarouselTileContainer>
    <TeaserCarouselTile
      image='/static/carousel/murdoch.png?size=496x372'
      count={12}
      byline='Joan Wong'
    >
    <TeaserCarouselHeadline.Editorial>
      Die Dynastie Murdoch
    </TeaserCarouselHeadline.Editorial>

    </TeaserCarouselTile>
      <TeaserCarouselTile
      image='/static/carousel/homestory.png?size=496x372'
      count={6}
      byline='Doug Chayka'
    >
      <TeaserCarouselHeadline.Editorial>
        Homestory
      </TeaserCarouselHeadline.Editorial>
    </TeaserCarouselTile>

    <TeaserCarouselTile
      image='/static/carousel/eth.png?size=496x372'
      count={8}
    >
      <TeaserCarouselHeadline.Editorial>
        Der Fall ETH
      </TeaserCarouselHeadline.Editorial>
    </TeaserCarouselTile>

    <TeaserCarouselTile
      image='/static/carousel/mike.png?size=496x372'
      count={24}
    >
      <TeaserCarouselHeadline.Editorial>
        «Am Limit»: Die Geschichte von Mike
      </TeaserCarouselHeadline.Editorial>
    </TeaserCarouselTile>

    <TeaserCarouselTile
      image='/static/carousel/strahlen.png?size=496x372'
      count={10}
    >
      <TeaserCarouselHeadline.Editorial>
        Geheimnisvolle Strahlen
      </TeaserCarouselHeadline.Editorial>
    </TeaserCarouselTile>

  </TeaserCarouselTileContainer>
</TeaserCarousel>
```
