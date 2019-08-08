A `<TeaserFrontCarousel />` is a row of teaser cards through which the user can scroll horizontally.

Changelog:
 - Two new colors: outline & tag
- one new font size

- Uses the same media queries as TeaserFront (like Dossier).
- Used for "Alle Serien", "Alle Formatte", "Alle Kolumnen", "All Recenzionen"
- "Alle Serien" has a black background.
- the Credit component is from TeaserFront


Supported props:
- `color`: The text color.
- `bgColor`: The background color.

### `<TeaserFrontCarousel />`: default

```react
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
    <TeaserFrontCarouselTag color='red'>Film</TeaserFrontCarouselTag>
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

### `<TeaserFrontCarousel />`: black background

```react
<TeaserFrontCarousel format='Alle Serien' bgColor='#000' color='#FFF'>
  <TeaserFrontCarouselTile image='/static/carousel/murdoch.png' color='#FFF' noOutline>
   <TeaserFrontCarouselHeadline>Die Dynastie Murdoch</TeaserFrontCarouselHeadline>
  </TeaserFrontCarouselTile>

  <TeaserFrontCarouselTile image='/static/carousel/homestory.png' color='#FFF' noOutline>
   <TeaserFrontCarouselHeadline>Homestory</TeaserFrontCarouselHeadline>
  </TeaserFrontCarouselTile>


</TeaserFrontCarousel>
```
