A `<TeaserFrontDossier />` is a front page teaser for a dossier. It features
- a `<TeaserFrontDossierIntro />` with headline, lead and an optional image
- a `<TeaserFrontTileRow />` with up to three article teasers

Props:
- `onClick`: An onclick handler.

```react
<TeaserFrontDossier>
  <TeaserFrontDossierIntro>
    <DossierTag>Dossier</DossierTag>
    <TeaserFrontDossierHeadline>Dossiertitel</TeaserFrontDossierHeadline>
    <TeaserFrontDossierLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
    </TeaserFrontDossierLead>
  </TeaserFrontDossierIntro>
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
  </TeaserFrontTileRow>
  <TeaserFrontDossierMore>Mehr zum Thema</TeaserFrontDossierMore>
</TeaserFrontDossier>
```

```react
<TeaserFrontDossier>
  <TeaserFrontDossierIntro image='/static/desert.jpg?size=4323x2962'>
    <DossierTag>Dossier</DossierTag>
    <TeaserFrontDossierHeadline>Dossiertitel</TeaserFrontDossierHeadline>
    <TeaserFrontDossierLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
    </TeaserFrontDossierLead>
  </TeaserFrontDossierIntro>
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
  </TeaserFrontTileRow>
  <TeaserFrontDossierMore>Mehr zum Thema</TeaserFrontDossierMore>
</TeaserFrontDossier>
```


```react
<TeaserFrontDossier>
  <TeaserFrontDossierIntro image='/static/rothaus_portrait.jpg'>
    <DossierTag>Dossier</DossierTag>
    <TeaserFrontDossierHeadline>Dossiertitel</TeaserFrontDossierHeadline>
    <TeaserFrontDossierLead>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
    </TeaserFrontDossierLead>
  </TeaserFrontDossierIntro>
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
  </TeaserFrontTileRow>
  <TeaserFrontDossierMore>Mehr zum Thema</TeaserFrontDossierMore>
</TeaserFrontDossier>
```
