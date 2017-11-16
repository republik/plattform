An `<InfoBox />` features informational content interspersed into the main editorial content.

Supported props:
- `size`:
  - `regular` (default): Use full container width.
  - `breakout`: Break out to the left and use full container width.
  - `float`: Break out to the left and let other elements flow around.
- `imageFloat`: Enforce floating image on desktop. On mobile the image floats, while on desktop the image is rendered in a 2-column layout.
- `imageSize`: The image size, `S` (default), `M` or `L`. Ignored when `size` is `float`.

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
    <Caption>
      <Byline>Photo: Laurent Burst</Byline>
    </Caption>
  </InfoBoxFigure>
  <InfoBoxText>
    One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.
  </InfoBoxText>
</InfoBox>
```

```react
<InfoBox imageFloat>
  <InfoBoxTitle>This is a box title</InfoBoxTitle>
  <InfoBoxFigure>
    <Image src='/static/landscape.jpg' alt='' />
    <Caption>
      <Byline>Photo: Laurent Burst</Byline>
    </Caption>
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
    <Caption>
      <Byline>Photo: Laurent Burst</Byline>
    </Caption>
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
    <Caption>
      <Byline>Photo: Laurent Burst</Byline>
    </Caption>
  </InfoBoxFigure>
  <InfoBoxText>
    One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.
  </InfoBoxText>
</InfoBox>
```

### Sizes in context

```react
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <InfoBox size={'breakout'} imageSize={'S'}>
    <InfoBoxTitle>This is a breakout info box</InfoBoxTitle>
    <InfoBoxFigure>
      <Image src='/static/landscape.jpg' alt='' />
      <Caption>
        <Byline>Photo: Laurent Burst</Byline>
      </Caption>
    </InfoBoxFigure>
    <InfoBoxText>
      One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.
    </InfoBoxText>
  </InfoBox>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <InfoBox size={'breakout'} imageSize={'M'}>
    <InfoBoxTitle>This is a breakout info box</InfoBoxTitle>
    <InfoBoxFigure>
      <Image src='/static/landscape.jpg' alt='' />
      <Caption>
        <Byline>Photo: Laurent Burst</Byline>
      </Caption>
    </InfoBoxFigure>
    <InfoBoxText>
      One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.
    </InfoBoxText>
  </InfoBox>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <InfoBox size={'breakout'} imageSize={'L'}>
    <InfoBoxTitle>This is a breakout info box</InfoBoxTitle>
    <InfoBoxFigure>
      <Image src='/static/landscape.jpg' alt='' />
      <Caption>
        <Byline>Photo: Laurent Burst</Byline>
      </Caption>
    </InfoBoxFigure>
    <InfoBoxText>
      One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.
    </InfoBoxText>
  </InfoBox>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <InfoBox size={'float'}>
    <InfoBoxTitle>This is a float info box</InfoBoxTitle>
    <InfoBoxText>
      One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.
    </InfoBoxText>
  </InfoBox>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <InfoBox size={'float'}>
    <InfoBoxTitle>This is a float info box</InfoBoxTitle>
    <InfoBoxFigure>
      <Image src='/static/landscape.jpg' alt='' />
      <Caption>
        <Byline>Photo: Laurent Burst</Byline>
      </Caption>
    </InfoBoxFigure>
    <InfoBoxText>
      One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.
    </InfoBoxText>
  </InfoBox>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```
