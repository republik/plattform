A `<TeaserFrontTypo />` is a front page teaser that features big typographic text without any image.

Supported props:
- `color`: The text color.
- `bgColor`: The background color to use in stacked mode.

A `<TeaserFrontTypoHeadline />` should be used. The default font size can be changed with either of these props:
- `medium`: Whether the font size shoud be increased to medium.
- `large`: Whether the font size shoud be increased to large.
- `small`: Whether the font size should be decreased to small. Currently only supported for `<TeaserFrontTypoHeadline.Interaction />`

```react
<TeaserFrontTypo color='#000' bgColor='#fff'>
  <TeaserFrontTypoHeadline.Editorial>The quick brown fox</TeaserFrontTypoHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink color='#000' href='#'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontTypo>
```

```react
<TeaserFrontTypo color='#000' bgColor='#fff'>
  <TeaserFrontTypoHeadline.Editorial medium>The quick fox</TeaserFrontTypoHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink color='#000' href='#'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontTypo>
```

```react
<TeaserFrontTypo color='#000' bgColor='#fff'>
  <TeaserFrontTypoHeadline.Editorial large>The Fox</TeaserFrontTypoHeadline.Editorial>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink color='#000' href='#'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontTypo>
```

```react
<TeaserFrontTypo color='#fff' bgColor='#000' >
  <TeaserFrontTypoHeadline.Interaction>The quick brown fox</TeaserFrontTypoHeadline.Interaction>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink color='#fff' href='#'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontTypo>
```

```react
<TeaserFrontTypo color='#fff' bgColor='#000' >
  <TeaserFrontTypoHeadline.Interaction medium>The quick fox</TeaserFrontTypoHeadline.Interaction>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink color='#fff' href='#'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontTypo>
```

```react
<TeaserFrontTypo color='#fff' bgColor='#000' >
  <TeaserFrontTypoHeadline.Interaction large>The Fox</TeaserFrontTypoHeadline.Interaction>
  <TeaserFrontLead>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
  </TeaserFrontLead>
  <TeaserFrontCredit>
    An article by <TeaserFrontCreditLink color='#fff' href='#'>Christof Moser</TeaserFrontCreditLink>, 31 December 2017
  </TeaserFrontCredit>
</TeaserFrontTypo>
```

```react
<TeaserFrontTypo color='#000' bgColor='#fff'>
  <Editorial.Format>Umfrage</Editorial.Format>
  <TeaserFrontTypoHeadline.Interaction small>Mehr Geld f??r ausl??ndische Autorinnen oder einen Bundeshaus&shy;korrespondent?</TeaserFrontTypoHeadline.Interaction>
  <TeaserFrontCredit>
    <TeaserFrontCreditLink color='#000' href='#'>Constantin Seibt</TeaserFrontCreditLink> fragt nach<br />31. December 2017
  </TeaserFrontCredit>
</TeaserFrontTypo>
```

```react
<TeaserFrontTypo color='#000' bgColor='#fff'>
  <TeaserFrontLogo logo='/static/50Jahre_Frauenwahlrecht_positiv.svg' alt='50 Jahre Frauenstimmrecht' />
  <Editorial.Format>50 Jahre Frauenstimmrecht</Editorial.Format>
  <TeaserFrontTypoHeadline.Interaction small>Mehr Geld f??r ausl??ndische Autorinnen oder einen Bundeshaus&shy;korrespondent?</TeaserFrontTypoHeadline.Interaction>
  <TeaserFrontCredit>
    <TeaserFrontCreditLink color='#000' href='#'>Constantin Seibt</TeaserFrontCreditLink> fragt nach<br />31. December 2017
  </TeaserFrontCredit>
</TeaserFrontTypo>
```
