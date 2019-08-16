A `<TeaserCarousel />` is a row of teaser cards through which the user can scroll horizontally.


Notes:
- Uses the same media queries as Teaser (like Dossier).
- Used for "Alle Serien", "Alle Formatte", "Alle Kolumnen", "All Recenzionen"
- "Alle Serien" has a black background.
- the Credit component is not specific to the Carousel.


Supported props:
- `color`: The text color.
- `bgColor`: The background color.


### `<TeaserCarousel />`: default

```react|responsive
<TeaserCarousel>
  <TeaserSectionTitle href="/recenzionen">Alle Rezensionen</TeaserSectionTitle>
  <TeaserCarouselRow>
    <TeaserCarouselTile byline='Foto: Laurent Burst' image='/static/carousel/test.png' onClick={() => console.log("click on first tile")}>
      <TeaserCarouselTag>Poesie & Prosa</TeaserCarouselTag>
      <TeaserCarouselHeadline.Editorial>Das Rätsel Dag Solstad</TeaserCarouselHeadline.Editorial>
      <TeaserCarouselLead>
        Dag Solstad: «T. Singer» Der Norweger gehört zu den schrulligsssen Autoren der Gegenwart.
      </TeaserCarouselLead>
      <Editorial.Credit>
        Von <Editorial.A  color='#000' href='#'>Jan Wilm</Editorial.A >, 05.07.2019
      </Editorial.Credit>

    </TeaserCarouselTile>

    <TeaserCarouselTile image='/static/carousel/jackson.png?size=400x216' byline='Foto: Laurent Burst' >
      <TeaserCarouselTag>Film</TeaserCarouselTag>
      <TeaserCarouselHeadline.Editorial>Echt jetzt?</TeaserCarouselHeadline.Editorial>
      <TeaserCarouselLead>
        Peter Jackson: «They Shall Not Grow Old» Der Blockbuster-Regisseur zeigt den Ersten Weltkrieg.
      </TeaserCarouselLead>
      <Editorial.Credit>
        Von <Editorial.A  color='#000' href='#'>Simon Spiegel</Editorial.A >, 05.07.2019
      </Editorial.Credit>
    </TeaserCarouselTile>

    <TeaserCarouselTile image='/static/carousel/vault.png'>
      <TeaserCarouselHeadline.Editorial>Tote Sprachen leben länger</TeaserCarouselHeadline.Editorial>
      <TeaserCarouselLead>
        «Heaven’s Vault» ist ein aussergewöhnliches Adventure-Game.
      </TeaserCarouselLead>
      <Editorial.Credit>
        Von <Editorial.A  color='#000' href='#'>Christof Zurschmitten</Editorial.A >, 05.07.2019
      </Editorial.Credit>
    </TeaserCarouselTile>

    <TeaserCarouselTile byline='Foto: Laurent Burst' image='/static/carousel/rinck.png'>
      <TeaserCarouselHeadline.Editorial>Die vier Gangarten von lechts nach Rinck</TeaserCarouselHeadline.Editorial>
      <TeaserCarouselLead>
        Die Essays und Gedichte von Monika Rinck sind das originellste Denkabenteuer.
      </TeaserCarouselLead>
      <Editorial.Credit>
        Von <Editorial.A  color='#000' href='#'>Daniel Graf</Editorial.A >, 05.07.2019
      </Editorial.Credit>
    </TeaserCarouselTile>

    <TeaserCarouselTile image='/static/carousel/calle.png' byline='Foto: Laurent Burst'>
      <TeaserCarouselTag>Kunst</TeaserCarouselTag>
      <TeaserCarouselHeadline.Editorial>Blindes Sehen</TeaserCarouselHeadline.Editorial>
      <TeaserCarouselLead>
        Sophie Calle: «Un certain regard» Das Fotomuseum Winterthur zeigt eine beeindruckende Schau.
      </TeaserCarouselLead>
      <Editorial.Credit>
        Von <Editorial.A  color='#000' href='#'>Daniel Binswanger</Editorial.A >, 05.07.2019
      </Editorial.Credit>
    </TeaserCarouselTile>
  </TeaserCarouselRow>
</TeaserCarousel>
```
### `<TeaserCarousel />`: with only 3 elements
Below 4 tiles, each tile will use 33% of the space available, up to a maximum of 450 pixels.

```react
<TeaserCarousel>
 <TeaserSectionTitle>Alle Formate</TeaserSectionTitle>
  <TeaserCarouselRow>
    <TeaserCarouselTile image='/static/carousel/binswanger.png' onClick={() => console.log("click on first tile")}>
      <TeaserCarouselTag color='#00B4FF'>
        Binswanger
      </TeaserCarouselTag>

      <TeaserCarouselHeadline.Editorial>
        «Was verbindet die rechtspopulsistischen Parteien eigentlich?»
      </TeaserCarouselHeadline.Editorial>

      <Editorial.Credit>
        Von <Editorial.A href='#'>Daniel Binswanger</Editorial.A >, 05.07.2019
      </Editorial.Credit>
    </TeaserCarouselTile>

    <TeaserCarouselTile image='/static/carousel/berg.png' onClick={() => console.log("click on first tile")}>
      <TeaserCarouselTag color="#00B4FF">Sybille Berg</TeaserCarouselTag>
      <TeaserCarouselHeadline.Editorial>
        «Was führt Männer oft zu fast albern anmutender Selbstüber-schätzung?»
      </TeaserCarouselHeadline.Editorial>
      <Editorial.Credit>
        Von <Editorial.A href='#'>Sybille Berg</Editorial.A >, 05.07.2019
      </Editorial.Credit>
    </TeaserCarouselTile>

    <TeaserCarouselTile image='/static/carousel/niggli.png' onClick={() => console.log("click on first tile")}>
      <TeaserCarouselTag color="#00B4FF">Niggli</TeaserCarouselTag>
      <TeaserCarouselHeadline.Editorial>
        Sir Kim Darroch, Ritter der ungeschminkten Wahrheit
      </TeaserCarouselHeadline.Editorial>
      <Editorial.Credit>
        Von <Editorial.A href='#'>Marcel Alexander Niggli</Editorial.A >, 05.07.2019
      </Editorial.Credit>
    </TeaserCarouselTile>


 </TeaserCarouselRow>

</TeaserCarousel>
```


### `<TeaserCarousel />`: black background

```react|responsive
<TeaserCarousel bgColor='#000' color='#FFF'>
  <TeaserSectionTitle>Alle Serien</TeaserSectionTitle>

  <TeaserCarouselRow>
    <TeaserCarouselTile bigger image='/static/carousel/murdoch.png' count={12} bgColor='#000' color='#FFF' noOutline byline='Foto: Laurent Burst'>
    <TeaserCarouselHeadline.Editorial bigger>Die Dynastie Murdoch</TeaserCarouselHeadline.Editorial>
    </TeaserCarouselTile>

    <TeaserCarouselTile bigger image='/static/carousel/homestory.png' count={6} bgColor='#000' color='#FFF' noOutline byline='Foto: Laurent Burst'>
    <TeaserCarouselHeadline.Editorial bigger>Homestory</TeaserCarouselHeadline.Editorial>
    </TeaserCarouselTile>

    <TeaserCarouselTile bigger image='/static/carousel/eth.png' count={8} bgColor='#000' color='#FFF' noOutline>
    <TeaserCarouselHeadline.Editorial bigger>Der Fall ETH</TeaserCarouselHeadline.Editorial>
    </TeaserCarouselTile>

    <TeaserCarouselTile bigger image='/static/carousel/mike.png' count={24} bgColor='#000' color='#FFF' noOutline>
    <TeaserCarouselHeadline.Editorial bigger>«Am Limit»: Die Geschichte von Mike</TeaserCarouselHeadline.Editorial>
    </TeaserCarouselTile>

    <TeaserCarouselTile bigger image='/static/carousel/strahlen.png' count={10   } bgColor='#000' color='#FFF' noOutline>
    <TeaserCarouselHeadline.Editorial bigger>Geheimnisvolle Strahlen</TeaserCarouselHeadline.Editorial>
    </TeaserCarouselTile>

  </TeaserCarouselRow>
</TeaserCarousel>
```

### `<TeaserCarouselTile />`

A Carousel has `TeaserCarouselTile` as direct children. They can also be customized.
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
<TeaserCarouselTile image='/static/carousel/calle.png' bgColor='#FFF' >
  <TeaserCarouselTag>Kunst</TeaserCarouselTag>
  <TeaserCarouselHeadline.Editorial>Blindes Sehen</TeaserCarouselHeadline.Editorial>
  <TeaserCarouselLead>
    Sophie Calle: «Un certain regard» Das Fotomuseum Winterthur zeigt eine beeindruckende Schau.
  </TeaserCarouselLead>
  <Editorial.Credit>
    Von <Editorial.A  color='#000' href='#'>Daniel Binswanger</Editorial.A >, 05.07.2019
  </Editorial.Credit>
</TeaserCarouselTile>
```

### `<TeaserCarouselHeadline />`
Supported props:
- `bigger` (boolean): if `true`, the font size and line height will be increased.
- `children`: children components.

#### Default (font-size: 19px)
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

#### `bigger` = `true` (font-size: 28px)
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

