An `<InfoBox />` features informational content interspersed into the main editorial content.

Supported props:
- `size`:
  - `regular` (default): Use full container width.
  - `breakout`: Break out to the left and use full container width.
  - `float`: Break out to the left and let other elements flow around.
- `figureSize`: The image size, `XS`, `S`, `M` or `L`. Should always be `XS` when `size` is `float`.
- `figureFloat`: Enforce floating image on desktop.

```react
<InfoBox>
  <InfoBoxTitle>This is a box title</InfoBoxTitle>
  <InfoBoxText>
    One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought.
  </InfoBoxText>
</InfoBox>
```

```react
<InfoBox figureSize='S'>
  <InfoBoxTitle>This is a box title</InfoBoxTitle>
  <Figure>
    <FigureImage src='/static/landscape.jpg' alt='' />
    <FigureCaption>
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <InfoBoxText>
    One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.
  </InfoBoxText>
</InfoBox>
```

```react
<InfoBox figureSize='S' figureFloat>
  <InfoBoxTitle>This is a box title</InfoBoxTitle>
  <Figure>
    <FigureImage src='/static/landscape.jpg' alt='' />
    <FigureCaption>
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <InfoBoxText>
    One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.
  </InfoBoxText>
</InfoBox>
```

```react
<InfoBox figureSize='M'>
  <InfoBoxTitle>This is a box title</InfoBoxTitle>
  <Figure>
    <FigureImage src='/static/landscape.jpg' alt='' />
    <FigureCaption>
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <InfoBoxText>
    One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.
  </InfoBoxText>
</InfoBox>
```

```react
<InfoBox figureSize='L'>
  <InfoBoxTitle>This is a box title</InfoBoxTitle>
  <Figure>
    <FigureImage src='/static/landscape.jpg' alt='' />
    <FigureCaption>
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <InfoBoxText>
    One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.
  </InfoBoxText>
</InfoBox>
```

### Sizes in context

```react|responsive
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <InfoBox size='breakout' figureSize='S'>
    <InfoBoxTitle>This is a breakout info box</InfoBoxTitle>
    <Figure>
      <FigureImage src='/static/landscape.jpg' alt='' />
      <FigureCaption>
        <FigureByline>Photo: Laurent Burst</FigureByline>
      </FigureCaption>
    </Figure>
    <InfoBoxText>
      One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.
    </InfoBoxText>
  </InfoBox>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react|responsive
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <InfoBox size='breakout' figureSize='M'>
    <InfoBoxTitle>This is a breakout info box</InfoBoxTitle>
    <Figure>
      <FigureImage src='/static/landscape.jpg' alt='' />
      <FigureCaption>
        <FigureByline>Photo: Laurent Burst</FigureByline>
      </FigureCaption>
    </Figure>
    <InfoBoxText>
      One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.
    </InfoBoxText>
  </InfoBox>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react|responsive
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <InfoBox size='breakout' figureSize='L'>
    <InfoBoxTitle>This is a breakout info box</InfoBoxTitle>
    <Figure>
      <FigureImage src='/static/landscape.jpg' alt='' />
      <FigureCaption>
        <FigureByline>Photo: Laurent Burst</FigureByline>
      </FigureCaption>
    </Figure>
    <InfoBoxText>
      One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.
    </InfoBoxText>
  </InfoBox>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react|responsive
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <InfoBox size='float'>
    <InfoBoxTitle>This is a float info box</InfoBoxTitle>
    <InfoBoxText>
      One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.
    </InfoBoxText>
  </InfoBox>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react|responsive
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <InfoBox size='float' figureSize='XS'>
    <InfoBoxTitle>This is a float info box</InfoBoxTitle>
    <Figure>
      <FigureImage src='/static/landscape.jpg' alt='' />
      <FigureCaption>
        <FigureByline>Photo: Laurent Burst</FigureByline>
      </FigureCaption>
    </Figure>
    <InfoBoxText>
      One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.
    </InfoBoxText>
  </InfoBox>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```
