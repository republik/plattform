### `<DossierTag />`
```react
<DossierTag>Dossier</DossierTag>
```

### `<DossierSubheader />`
```react
<DossierSubheader>Diese Artikel sind im Dossier enthalten:</DossierSubheader>
```

### `<TeaserFrontTileRow />`

For article teasers in a dossier, a `<TeaserFrontTileRow columns={3} />` should be used. It will take any number of `<TeaserFrontTile />` children and group them into three per row (desktop only).

```react
<TeaserFrontTileRow columns={3}>
  <TeaserFrontTile image='/static/rothaus_landscape.jpg'>
    <DossierTileHeadline.Editorial>The quick brown fox</DossierTileHeadline.Editorial>
    <DossierTileLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
    </DossierTileLead>
    <TeaserFrontCredit>
      An article by <TeaserFrontCreditLink href='#'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
  <TeaserFrontTile>
    <Editorial.Format>Umfrage</Editorial.Format>
    <DossierTileHeadline.Interaction>Mehr Geld für ausländische Autorinnen oder einen Bundeshaus&shy;korrespondent?</DossierTileHeadline.Interaction>
    <TeaserFrontCredit>
      <TeaserFrontCreditLink href='#'>Constantin Seibt</TeaserFrontCreditLink> fragt nach<br />31. December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
  <TeaserFrontTile image='/static/rothaus_portrait.jpg'>
    <DossierTileHeadline.Editorial>The fox</DossierTileHeadline.Editorial>
    <DossierTileLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
    </DossierTileLead>
    <TeaserFrontCredit>
      An article by <TeaserFrontCreditLink href='#'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
  <TeaserFrontTile>
    <Editorial.Format>Umfrage</Editorial.Format>
    <DossierTileHeadline.Interaction>Mehr Geld für ausländische Autorinnen oder einen Bundeshaus&shy;korrespondent?</DossierTileHeadline.Interaction>
    <TeaserFrontCredit>
      <TeaserFrontCreditLink href='#'>Constantin Seibt</TeaserFrontCreditLink> fragt nach<br />31. December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
  <TeaserFrontTile image='/static/rothaus_portrait.jpg'>
    <DossierTileHeadline.Editorial>The fox</DossierTileHeadline.Editorial>
    <DossierTileLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
    </DossierTileLead>
    <TeaserFrontCredit>
      An article by <TeaserFrontCreditLink href='#'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
    </TeaserFrontCredit>
  </TeaserFrontTile>
</TeaserFrontTileRow>
```
