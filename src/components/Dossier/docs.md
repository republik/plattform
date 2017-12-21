### `<DossierTag />`
```react
<DossierTag>Dossier</DossierTag>
```

### `<DossierSubheader />`
```react
<DossierSubheader>Diese Artikel sind im Dossier enthalten:</DossierSubheader>
```

### `<DossierTileRow />`

A `<DossierTileRow />` will take any number of `<DossierTile />` children and group them into three per row (desktop only).

```react
<DossierTileRow>
  <DossierTile image='/static/rothaus_landscape.jpg'>
    <DossierTileHeadline.Editorial>The quick brown fox</DossierTileHeadline.Editorial>
    <TeaserFrontLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
    </TeaserFrontLead>
    <TeaserFrontCredit>
      An article by <TeaserFrontCreditLink href='#'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
    </TeaserFrontCredit>
  </DossierTile>
  <DossierTile>
    <Editorial.Format>Umfrage</Editorial.Format>
    <DossierTileHeadline.Interaction>Mehr Geld für ausländische Autorinnen oder einen Bundeshaus&shy;korrespondent?</DossierTileHeadline.Interaction>
    <TeaserFrontCredit>
      <TeaserFrontCreditLink href='#'>Constantin Seibt</TeaserFrontCreditLink> fragt nach<br />31. December 2017
    </TeaserFrontCredit>
  </DossierTile>
  <DossierTile image='/static/rothaus_portrait.jpg'>
    <DossierTileHeadline.Editorial>The fox</DossierTileHeadline.Editorial>
    <TeaserFrontLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
    </TeaserFrontLead>
    <TeaserFrontCredit>
      An article by <TeaserFrontCreditLink href='#'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
    </TeaserFrontCredit>
  </DossierTile>
  <DossierTile>
    <Editorial.Format>Umfrage</Editorial.Format>
    <DossierTileHeadline.Interaction>Mehr Geld für ausländische Autorinnen oder einen Bundeshaus&shy;korrespondent?</DossierTileHeadline.Interaction>
    <TeaserFrontCredit>
      <TeaserFrontCreditLink href='#'>Constantin Seibt</TeaserFrontCreditLink> fragt nach<br />31. December 2017
    </TeaserFrontCredit>
  </DossierTile>
  <DossierTile image='/static/rothaus_portrait.jpg'>
    <DossierTileHeadline.Editorial>The fox</DossierTileHeadline.Editorial>
    <TeaserFrontLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
    </TeaserFrontLead>
    <TeaserFrontCredit>
      An article by <TeaserFrontCreditLink href='#'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
    </TeaserFrontCredit>
  </DossierTile>
</DossierTileRow>
```
