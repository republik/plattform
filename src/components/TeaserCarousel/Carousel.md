A `<TeaserFrontCarousel />` is a row of teaser cards through which the user can scroll horizontally.

Changelog:
- A new color: outline `#D7D7D7`

Notes:
- Uses the same media queries as TeaserFront (like Dossier).
- Used for "Alle Serien", "Alle Formatte", "Alle Kolumnen", "All Recenzionen"
- "Alle Serien" has a black background.
- the Credit component is not specific to the Carousel.


Supported props:
- `color`: The text color.
- `bgColor`: The background color.


### `<TeaserFrontCarousel />`: default

```react|responsive
<TeaserFrontCarousel>
  <TeaserFrontSectionTitle href="/recenzionen">Alle Rezensionen</TeaserFrontSectionTitle>
  <TeaserFrontCarouselRow>
    <TeaserFrontCarouselTile byline='Foto: Laurent Burst' image='/static/carousel/test.png' onClick={() => console.log("click on first tile")}>
      <TeaserFrontCarouselTag>Poesie & Prosa</TeaserFrontCarouselTag>
      <TeaserFrontCarouselHeadline.Editorial>Das Rätsel Dag Solstad</TeaserFrontCarouselHeadline.Editorial>
      <TeaserFrontCarouselLead>
        Dag Solstad: «T. Singer» Der Norweger gehört zu den schrulligsssen Autoren der Gegenwart.
      </TeaserFrontCarouselLead>
      <Editorial.Credit>
        Von <Editorial.A  color='#000' href='#'>Jan Wilm</Editorial.A >, 05.07.2019
      </Editorial.Credit>

    </TeaserFrontCarouselTile>

    <TeaserFrontCarouselTile image='/static/carousel/jackson.png' byline='Foto: Laurent Burst' >
      <TeaserFrontCarouselTag>Film</TeaserFrontCarouselTag>
      <TeaserFrontCarouselHeadline.Editorial>Echt jetzt?</TeaserFrontCarouselHeadline.Editorial>
      <TeaserFrontCarouselLead>
        Peter Jackson: «They Shall Not Grow Old» Der Blockbuster-Regisseur zeigt den Ersten Weltkrieg.
      </TeaserFrontCarouselLead>
      <Editorial.Credit>
        Von <Editorial.A  color='#000' href='#'>Simon Spiegel</Editorial.A >, 05.07.2019
      </Editorial.Credit>
    </TeaserFrontCarouselTile>

    <TeaserFrontCarouselTile image='/static/carousel/vault.png'>
      <TeaserFrontCarouselHeadline.Editorial>Tote Sprachen leben länger</TeaserFrontCarouselHeadline.Editorial>
      <TeaserFrontCarouselLead>
        «Heaven’s Vault» ist ein aussergewöhnliches Adventure-Game.
      </TeaserFrontCarouselLead>
      <Editorial.Credit>
        Von <Editorial.A  color='#000' href='#'>Christof Zurschmitten</Editorial.A >, 05.07.2019
      </Editorial.Credit>
    </TeaserFrontCarouselTile>

    <TeaserFrontCarouselTile image='/static/carousel/rinck.png'>
      <TeaserFrontCarouselHeadline.Editorial>Die vier Gangarten von lechts nach Rinck</TeaserFrontCarouselHeadline.Editorial>
      <TeaserFrontCarouselLead>
        Die Essays und Gedichte von Monika Rinck sind das originellste Denkabenteuer.
      </TeaserFrontCarouselLead>
      <Editorial.Credit>
        Von <Editorial.A  color='#000' href='#'>Daniel Graf</Editorial.A >, 05.07.2019
      </Editorial.Credit>
    </TeaserFrontCarouselTile>

    <TeaserFrontCarouselTile image='/static/carousel/calle.png' byline='Foto: Laurent Burst'>
      <TeaserFrontCarouselTag>Kunst</TeaserFrontCarouselTag>
      <TeaserFrontCarouselHeadline.Editorial>Blindes Sehen</TeaserFrontCarouselHeadline.Editorial>
      <TeaserFrontCarouselLead>
        Sophie Calle: «Un certain regard» Das Fotomuseum Winterthur zeigt eine beeindruckende Schau.
      </TeaserFrontCarouselLead>
      <Editorial.Credit>
        Von <Editorial.A  color='#000' href='#'>Daniel Binswanger</Editorial.A >, 05.07.2019
      </Editorial.Credit>
    </TeaserFrontCarouselTile>
  </TeaserFrontCarouselRow>
</TeaserFrontCarousel>
```
### `<TeaserFrontCarousel />`: with only 3 elements
Below 4 tiles, each tile will use 33% of the space available, up to a maximum of 450 pixels.

```react
<TeaserFrontCarousel>
 <TeaserFrontSectionTitle>Alle Formate</TeaserFrontSectionTitle>
  <TeaserFrontCarouselRow>
    <TeaserFrontCarouselTile image='/static/carousel/binswanger.png' onClick={() => console.log("click on first tile")}>
      <TeaserFrontCarouselTag color='#00B4FF'>
        Binswanger
      </TeaserFrontCarouselTag>

      <TeaserFrontCarouselHeadline.Editorial>
        «Was verbindet die rechtspopulsistischen Parteien eigentlich?»
      </TeaserFrontCarouselHeadline.Editorial>

      <Editorial.Credit>
        Von <Editorial.A href='#'>Daniel Binswanger</Editorial.A >, 05.07.2019
      </Editorial.Credit>
    </TeaserFrontCarouselTile>

    <TeaserFrontCarouselTile image='/static/carousel/berg.png' onClick={() => console.log("click on first tile")}>
      <TeaserFrontCarouselTag color="#00B4FF">Sybille Berg</TeaserFrontCarouselTag>
      <TeaserFrontCarouselHeadline.Editorial>
        «Was führt Männer oft zu fast albern anmutender Selbstüber-schätzung?»
      </TeaserFrontCarouselHeadline.Editorial>
      <Editorial.Credit>
        Von <Editorial.A href='#'>Sybille Berg</Editorial.A >, 05.07.2019
      </Editorial.Credit>
    </TeaserFrontCarouselTile>

    <TeaserFrontCarouselTile image='/static/carousel/niggli.png' onClick={() => console.log("click on first tile")}>
      <TeaserFrontCarouselTag color="#00B4FF">Niggli</TeaserFrontCarouselTag>
      <TeaserFrontCarouselHeadline.Editorial>
        Sir Kim Darroch, Ritter der ungeschminkten Wahrheit
      </TeaserFrontCarouselHeadline.Editorial>
      <Editorial.Credit>
        Von <Editorial.A href='#'>Marcel Alexander Niggli</Editorial.A >, 05.07.2019
      </Editorial.Credit>
    </TeaserFrontCarouselTile>


 </TeaserFrontCarouselRow>

</TeaserFrontCarousel>
```


### `<TeaserFrontCarousel />`: black background

```react|responsive
<TeaserFrontCarousel bgColor='#000' color='#FFF'>
  <TeaserFrontSectionTitle>Alle Serien</TeaserFrontSectionTitle>

  <TeaserFrontCarouselRow>
    <TeaserFrontCarouselTile bigger image='/static/carousel/murdoch.png' count={12} bgColor='#000' color='#FFF' noOutline byline='Foto: Laurent Burst'>
    <TeaserFrontCarouselHeadline.Editorial bigger>Die Dynastie Murdoch</TeaserFrontCarouselHeadline.Editorial>
    </TeaserFrontCarouselTile>

    <TeaserFrontCarouselTile bigger image='/static/carousel/homestory.png' count={6} bgColor='#000' color='#FFF' noOutline byline='Foto: Laurent Burst'>
    <TeaserFrontCarouselHeadline.Editorial bigger>Homestory</TeaserFrontCarouselHeadline.Editorial>
    </TeaserFrontCarouselTile>

    <TeaserFrontCarouselTile bigger image='/static/carousel/eth.png' count={8} bgColor='#000' color='#FFF' noOutline>
    <TeaserFrontCarouselHeadline.Editorial bigger>Der Fall ETH</TeaserFrontCarouselHeadline.Editorial>
    </TeaserFrontCarouselTile>

    <TeaserFrontCarouselTile bigger image='/static/carousel/mike.png' count={24} bgColor='#000' color='#FFF' noOutline>
    <TeaserFrontCarouselHeadline.Editorial bigger>«Am Limit»: Die Geschichte von Mike</TeaserFrontCarouselHeadline.Editorial>
    </TeaserFrontCarouselTile>

    <TeaserFrontCarouselTile bigger image='/static/carousel/strahlen.png' count={10   } bgColor='#000' color='#FFF' noOutline>
    <TeaserFrontCarouselHeadline.Editorial bigger>Geheimnisvolle Strahlen</TeaserFrontCarouselHeadline.Editorial>
    </TeaserFrontCarouselTile>

  </TeaserFrontCarouselRow>
</TeaserFrontCarousel>
```

### `<TeaserFrontCarouselTile />`

A Carousel has `TeaserFrontCarouselTile` as direct children. They can also be customized.
Supported props:
- `color`: The text color. Default: black.
- `bgColor`: The background color. Default: none.
- `noOutline`: Boolean, no outline when `true`. Default: `false`.
- `count`: if an article `count` (number) is provided, this number in an icon will be displayed.

- `bigger`: -> Alle Serien

- `image`: image source.
- `alt`: image alt text.
- `onClick`: function executed on click.
- `children`: children components.


```react
<TeaserFrontCarouselTile image='/static/carousel/calle.png' bgColor='#FFF' >
  <TeaserFrontCarouselTag>Kunst</TeaserFrontCarouselTag>
  <TeaserFrontCarouselHeadline.Editorial>Blindes Sehen</TeaserFrontCarouselHeadline.Editorial>
  <TeaserFrontCarouselLead>
    Sophie Calle: «Un certain regard» Das Fotomuseum Winterthur zeigt eine beeindruckende Schau.
  </TeaserFrontCarouselLead>
  <Editorial.Credit>
    Von <Editorial.A  color='#000' href='#'>Daniel Binswanger</Editorial.A >, 05.07.2019
  </Editorial.Credit>
</TeaserFrontCarouselTile>
```

### `<TeaserFrontCarouselHeadline />`
Supported props:
- `bigger` (boolean): if `true`, the font size and line height will be increased.
- `children`: children components.

#### Default (font-size: 19px)
```react|span-2
<TeaserFrontCarouselHeadline.Editorial>
  Das Rätsel Dag Solstad
</TeaserFrontCarouselHeadline.Editorial>
```
```react|span-2
<TeaserFrontCarouselHeadline.Interaction>
  Die Republik vorgelesen
</TeaserFrontCarouselHeadline.Interaction>
```
```react|span-2
<TeaserFrontCarouselHeadline.Scribble>
  Wer Talent hat, darf in die Schweiz migrieren
</TeaserFrontCarouselHeadline.Scribble>
```

#### `bigger` = `true` (font-size: 28px)
```react|span-2
<TeaserFrontCarouselHeadline.Editorial bigger>
  Die Dynastie Murdoch
</TeaserFrontCarouselHeadline.Editorial>
```
```react|span-2
<TeaserFrontCarouselHeadline.Interaction bigger>
  Die Republik vorgelesen
</TeaserFrontCarouselHeadline.Interaction>
```
```react|span-2
<TeaserFrontCarouselHeadline.Scribble bigger>
  Wer Talent hat, darf in die Schweiz migrieren
</TeaserFrontCarouselHeadline.Scribble>
```

