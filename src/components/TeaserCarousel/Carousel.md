A `<TeaserFrontCarousel />`.

UIses the same media queries as TeaserFront (like Dossier).

Supported props:
- `color`: The text color.
- `bgColor`: The background color to use in stacked mode.

```react|responsive
<TeaserFrontCarousel>
  <TeaserFrontCarouselTile image='/static/carousel/solstad.png'>
   <TeaserFrontCarouselHeadline>Das Rätsel Dag Solstad</TeaserFrontCarouselHeadline>
    <TeaserFrontCarouselLead>
      Dag Solstad: «T. Singer» Der Norweger gehört zu den schrulligsten Autoren der Gegenwart.
    </TeaserFrontCarouselLead>
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
