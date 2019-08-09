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
<TeaserFrontCarousel format='Alle Rezensionen'>
  <TeaserFrontCarouselTile image='/static/carousel/solstad.png' onClick={() => console.log("click on first tile")}>
    <TeaserFrontCarouselTag>Poesie & Prosa</TeaserFrontCarouselTag>
    <TeaserFrontCarouselHeadline>Das Rätsel Dag Solstad</TeaserFrontCarouselHeadline>
    <TeaserFrontCarouselLead>
      Dag Solstad: «T. Singer» Der Norweger gehört zu den schrulligsten Autoren der Gegenwart.
    </TeaserFrontCarouselLead>
    <Editorial.Credit>
      Von <Editorial.A  color='#000' href='#'>Jan Wilm</Editorial.A >, 05.07.2019
    </Editorial.Credit>

  </TeaserFrontCarouselTile>

  <TeaserFrontCarouselTile image='/static/carousel/jackson.png'>
    <TeaserFrontCarouselTag>Film</TeaserFrontCarouselTag>
    <TeaserFrontCarouselHeadline>Echt jetzt?</TeaserFrontCarouselHeadline>
    <TeaserFrontCarouselLead>
      Peter Jackson: «They Shall Not Grow Old» Der Blockbuster-Regisseur zeigt den Ersten Weltkrieg.
    </TeaserFrontCarouselLead>
    <Editorial.Credit>
      Von <Editorial.A  color='#000' href='#'>Simon Spiegel</Editorial.A >, 05.07.2019
    </Editorial.Credit>
  </TeaserFrontCarouselTile>

  <TeaserFrontCarouselTile image='/static/carousel/vault.png'>
    <TeaserFrontCarouselHeadline>Tote Sprachen leben länger</TeaserFrontCarouselHeadline>
    <TeaserFrontCarouselLead>
      «Heaven’s Vault» ist ein aussergewöhnliches Adventure-Game.
    </TeaserFrontCarouselLead>
    <Editorial.Credit>
      Von <Editorial.A  color='#000' href='#'>Christof Zurschmitten</Editorial.A >, 05.07.2019
    </Editorial.Credit>
  </TeaserFrontCarouselTile>

  <TeaserFrontCarouselTile image='/static/carousel/rinck.png'>
    <TeaserFrontCarouselHeadline>Die vier Gangarten von lechts nach Rinck</TeaserFrontCarouselHeadline>
    <TeaserFrontCarouselLead>
      Die Essays und Gedichte von Monika Rinck sind das originellste Denkabenteuer.
    </TeaserFrontCarouselLead>
    <Editorial.Credit>
      Von <Editorial.A  color='#000' href='#'>Daniel Graf</Editorial.A >, 05.07.2019
    </Editorial.Credit>
  </TeaserFrontCarouselTile>

  <TeaserFrontCarouselTile image='/static/carousel/calle.png'>
    <TeaserFrontCarouselTag>Kunst</TeaserFrontCarouselTag>
    <TeaserFrontCarouselHeadline>Blindes Sehen</TeaserFrontCarouselHeadline>
    <TeaserFrontCarouselLead>
      Sophie Calle: «Un certain regard» Das Fotomuseum Winterthur zeigt eine beeindruckende Schau.
    </TeaserFrontCarouselLead>
    <Editorial.Credit>
      Von <Editorial.A  color='#000' href='#'>Daniel Binswanger</Editorial.A >, 05.07.2019
    </Editorial.Credit>
  </TeaserFrontCarouselTile>

</TeaserFrontCarousel>
```
### `<TeaserFrontCarousel />`: with fewer elements


```react
<TeaserFrontCarousel format='Alle Rezensionen'>
  <TeaserFrontCarouselTile image='/static/carousel/binswanger.png' onClick={() => console.log("click on first tile")}>
    <TeaserFrontCarouselTag color='#00B4FF'>
      Binswanger
    </TeaserFrontCarouselTag>

    <TeaserFrontCarouselHeadline>
      «Was verbindet die rechtspopulsistischen Parteien eigentlich?»
    </TeaserFrontCarouselHeadline>

    <Editorial.Credit>
      Von <Editorial.A href='#'>Daniel Binswanger</Editorial.A >, 05.07.2019
    </Editorial.Credit>
  </TeaserFrontCarouselTile>

  <TeaserFrontCarouselTile image='/static/carousel/berg.png' onClick={() => console.log("click on first tile")}>
    <TeaserFrontCarouselTag color="#00B4FF">Sybille Berg</TeaserFrontCarouselTag>
    <TeaserFrontCarouselHeadline>
      «Was führt Männer oft zu fast albern anmutender Selbstüber-schätzung?»
    </TeaserFrontCarouselHeadline>
    <Editorial.Credit>
      Von <Editorial.A href='#'>Sybille Berg</Editorial.A >, 05.07.2019
    </Editorial.Credit>
  </TeaserFrontCarouselTile>

  <TeaserFrontCarouselTile image='/static/carousel/niggli.png' onClick={() => console.log("click on first tile")}>
    <TeaserFrontCarouselTag color="#00B4FF">Niggli</TeaserFrontCarouselTag>
    <TeaserFrontCarouselHeadline>
      Sir Kim Darroch, Ritter der ungeschminkten Wahrheit
    </TeaserFrontCarouselHeadline>
    <Editorial.Credit>
      Von <Editorial.A href='#'>Marcel Alexander Niggli</Editorial.A >, 05.07.2019
    </Editorial.Credit>
  </TeaserFrontCarouselTile>



</TeaserFrontCarousel>
```


### `<TeaserFrontCarousel />`: black background

```react
<TeaserFrontCarousel format='Alle Serien' bgColor='#000' color='#FFF'>
  <TeaserFrontCarouselTile image='/static/carousel/murdoch.png' count={12} bgColor='#000' color='#FFF' noOutline>
   <TeaserFrontCarouselHeadline bigger>Die Dynastie Murdoch</TeaserFrontCarouselHeadline>
  </TeaserFrontCarouselTile>

  <TeaserFrontCarouselTile image='/static/carousel/homestory.png' count={6} bgColor='#000' color='#FFF' noOutline>
   <TeaserFrontCarouselHeadline bigger>Homestory</TeaserFrontCarouselHeadline>
  </TeaserFrontCarouselTile>

  <TeaserFrontCarouselTile image='/static/carousel/eth.png' bgColor='#000' color='#FFF' noOutline>
   <TeaserFrontCarouselHeadline bigger>Der Fall ETH</TeaserFrontCarouselHeadline>
  </TeaserFrontCarouselTile>

  <TeaserFrontCarouselTile image='/static/carousel/mike.png' bgColor='#000' color='#FFF' noOutline>
   <TeaserFrontCarouselHeadline bigger>«Am Limit»: Die Geschichte von Mike</TeaserFrontCarouselHeadline>
  </TeaserFrontCarouselTile>

  <TeaserFrontCarouselTile image='/static/carousel/strahlen.png' bgColor='#000' color='#FFF' noOutline>
   <TeaserFrontCarouselHeadline bigger>Geheimnisvolle Strahlen</TeaserFrontCarouselHeadline>
  </TeaserFrontCarouselTile>


</TeaserFrontCarousel>
```

### `<TeaserFrontCarouselTile />`

A Carousel has `TeaserFrontCarouselTile` as direct children. They can also be customized.
Supported props:
- `color`: The text color. Default: black.
- `bgColor`: The background color. Default: none.
- `noOutline`: Boolean, no outline when `true`. Default: `false`.
- `count`: if an article `count` (number) is provided, this number in an icon will be displayed.
- `image`: image source.
- `alt`: image alt text.
- `onClick`: function executed on click.


```react
<div style={{maxWidth: '300px'}}>
  <TeaserFrontCarouselTile image='/static/carousel/calle.png' bgColor='#FFF' >
    <TeaserFrontCarouselTag>Kunst</TeaserFrontCarouselTag>
    <TeaserFrontCarouselHeadline>Blindes Sehen</TeaserFrontCarouselHeadline>
    <TeaserFrontCarouselLead>
      Sophie Calle: «Un certain regard» Das Fotomuseum Winterthur zeigt eine beeindruckende Schau.
    </TeaserFrontCarouselLead>
    <Editorial.Credit>
      Von <Editorial.A  color='#000' href='#'>Daniel Binswanger</Editorial.A >, 05.07.2019
    </Editorial.Credit>
  </TeaserFrontCarouselTile>
</div>
```