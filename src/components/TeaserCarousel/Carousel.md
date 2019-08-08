A `<TeaserFrontCarousel />` is a row of teaser cards through which the user can scroll horizontally.

- Uses the same media queries as TeaserFront (like Dossier).
- Used for "Alle Serien", "Alle Formatte", "Alle Kolumnen", "All Recenzionen"
- "Alle Serien" has a black background.
- the Credit component is from TeaserFront


Supported props:
- `color`: The text color.
- `bgColor`: The background color.

### `<TeaserFrontCarousel />`: default

```react
<TeaserFrontCarousel tag='Alle Rezensionen'>
  <TeaserFrontCarouselTile image='/static/carousel/solstad.png' onClick={() => console.log("click on first tile")}>
   <TeaserFrontCarouselHeadline>Das Rätsel Dag Solstad</TeaserFrontCarouselHeadline>
    <TeaserFrontCarouselLead>
      Dag Solstad: «T. Singer» Der Norweger gehört zu den schrulligsten Autoren der Gegenwart.
    </TeaserFrontCarouselLead>
     <TeaserFrontCredit>
      Von <TeaserFrontCreditLink color='#000' href='#'>Jan Wilm</TeaserFrontCreditLink>, 05.07.2019
    </TeaserFrontCredit>
  </TeaserFrontCarouselTile>

  <TeaserFrontCarouselTile image='/static/carousel/jackson.png'>
   <TeaserFrontCarouselHeadline>Echt jetzt?</TeaserFrontCarouselHeadline>
    <TeaserFrontCarouselLead>
      Peter Jackson: «They Shall Not Grow Old» Der Blockbuster-Regisseur zeigt den Ersten Weltkrieg.
    </TeaserFrontCarouselLead>
  </TeaserFrontCarouselTile>

  <TeaserFrontCarouselTile image='/static/carousel/vault.png'>
   <TeaserFrontCarouselHeadline>Tote Sprachen leben länger</TeaserFrontCarouselHeadline>
    <TeaserFrontCarouselLead>
      «Heaven’s Vault» ist ein aussergewöhnliches Adventure-Game.
    </TeaserFrontCarouselLead>
  </TeaserFrontCarouselTile>

  <TeaserFrontCarouselTile image='/static/carousel/rinck.png'>
   <TeaserFrontCarouselHeadline>Die vier Gangarten von lechts nach Rinck</TeaserFrontCarouselHeadline>
    <TeaserFrontCarouselLead>
      Die Essays und Gedichte von Monika Rinck sind das originellste Denkabenteuer.
    </TeaserFrontCarouselLead>
  </TeaserFrontCarouselTile>

  <TeaserFrontCarouselTile image='/static/carousel/calle.png'>
   <TeaserFrontCarouselHeadline>Blindes Sehen</TeaserFrontCarouselHeadline>
    <TeaserFrontCarouselLead>
      Sophie Calle: «Un certain regard» Das Fotomuseum Winterthur zeigt eine beeindruckende Schau.
    </TeaserFrontCarouselLead>
  </TeaserFrontCarouselTile>

</TeaserFrontCarousel>
```

### `<TeaserFrontCarousel />`: black background

```react
<TeaserFrontCarousel tag='Alle Serien' bgColor='#000' color='#FFF'>
  <TeaserFrontCarouselTile image='/static/carousel/murdoch.png' color='#FFF' noOutline>
   <TeaserFrontCarouselHeadline>Die Dynastie Murdoch</TeaserFrontCarouselHeadline>
  </TeaserFrontCarouselTile>

  <TeaserFrontCarouselTile image='/static/carousel/homestory.png' color='#FFF' noOutline>
   <TeaserFrontCarouselHeadline>Homestory</TeaserFrontCarouselHeadline>
  </TeaserFrontCarouselTile>


</TeaserFrontCarousel>
```
