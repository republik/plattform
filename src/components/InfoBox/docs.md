An `<InfoBox />` features informational content interspersed into the main editorial content.

Supported props:
- `float`: Enforce floating image on desktop. On mobile the image floats, while on desktop the image is rendered in a 2-column layout.
- `imageSize`: The image size, `S` (default), `M` or `L`.


```react
<InfoBox>
  <InfoBoxTitle>This is a box title</InfoBoxTitle>
  <InfoBoxText>
    One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought.
  </InfoBoxText>
</InfoBox>
```

```react
<InfoBox>
  <InfoBoxTitle>This is a box title</InfoBoxTitle>
  <InfoBoxFigure>
    <Image src='/static/landscape.jpg' alt='' />
    <Editorial.Caption>
      <Editorial.Byline>Photo: Laurent Burst</Editorial.Byline>
    </Editorial.Caption>
  </InfoBoxFigure>
  <InfoBoxText>
    One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.
  </InfoBoxText>
</InfoBox>
```

```react
<InfoBox float>
  <InfoBoxTitle>This is a box title</InfoBoxTitle>
  <InfoBoxFigure>
    <Image src='/static/landscape.jpg' alt='' />
    <Editorial.Caption>
      <Editorial.Byline>Photo: Laurent Burst</Editorial.Byline>
    </Editorial.Caption>
  </InfoBoxFigure>
  <InfoBoxText>
    One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.
  </InfoBoxText>
</InfoBox>
```

```react
<InfoBox imageSize={'M'}>
  <InfoBoxTitle>This is a box title</InfoBoxTitle>
  <InfoBoxFigure>
    <Image src='/static/landscape.jpg' alt='' />
    <Editorial.Caption>
      <Editorial.Byline>Photo: Laurent Burst</Editorial.Byline>
    </Editorial.Caption>
  </InfoBoxFigure>
  <InfoBoxText>
    One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.
  </InfoBoxText>
</InfoBox>
```

```react
<InfoBox imageSize={'L'}>
  <InfoBoxTitle>This is a box title</InfoBoxTitle>
  <InfoBoxFigure>
    <Image src='/static/landscape.jpg' alt='' />
    <Editorial.Caption>
      <Editorial.Byline>Photo: Laurent Burst</Editorial.Byline>
    </Editorial.Caption>
  </InfoBoxFigure>
  <InfoBoxText>
    One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.
  </InfoBoxText>
</InfoBox>
```
