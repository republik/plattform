An `<InfoBox />` features informational content interspersed into the main editorial content.

Supported props:
- `size`:
  - `regular` (default): Use full container width.
  - `breakout`: Break out to the left and use full container width.
  - `float`: Break out to the left and let other elements flow around.
- `figureSize`: The image size, `XS`, `S`, `M` or `L`. Should always be `XS` when `size` is `float`.
- `figureFloat`: Enforce floating image on desktop.
- `collapsable`: Whether the infobox should be collapsed by default.
- `collapsableEditorPreview`: forward `editorPreview` to collapsable component.

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

### collapsable

The `collapsable` attribute collapses the infobox, unless the content height is too small.

```react
<div>
<InfoBox collapsable t={t}>
  <InfoBoxTitle>This is a box title</InfoBoxTitle>
  <InfoBoxText>
    One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.
  </InfoBoxText>
  <InfoBoxText>
    One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment.
  </InfoBoxText>
</InfoBox>
<InfoBox collapsable t={t}>
  <InfoBoxTitle>This is a box title</InfoBoxTitle>
  <InfoBoxText>
    One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.
  </InfoBoxText>
</InfoBox>
</div>
```

For very long infoboxes, we scroll back to the title once the infobox has been closed.

```react
<div>
<InfoBox collapsable t={t}>
  <InfoBoxTitle>I am a big box</InfoBoxTitle>
  <InfoBoxText>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Mattis rhoncus urna neque viverra justo nec ultrices dui. Pharetra massa massa ultricies mi quis hendrerit dolor magna. Felis eget nunc lobortis mattis. Eu augue ut lectus arcu bibendum at varius vel pharetra. Et netus et malesuada fames ac turpis egestas. Auctor urna nunc id cursus metus. Condimentum mattis pellentesque id nibh tortor id aliquet lectus. Dolor sit amet consectetur adipiscing elit pellentesque habitant morbi tristique. Sed felis eget velit aliquet sagittis id. Sit amet justo donec enim diam vulputate. Nulla facilisi nullam vehicula ipsum a arcu. Venenatis urna cursus eget nunc. In egestas erat imperdiet sed euismod nisi. Scelerisque in dictum non consectetur a. Proin libero nunc consequat interdum. Lorem ipsum dolor sit amet consectetur adipiscing elit. Risus pretium quam vulputate dignissim suspendisse. Elementum integer enim neque volutpat ac tincidunt vitae. Suscipit tellus mauris a diam maecenas.</InfoBoxText>
  <InfoBoxText>Mauris vitae ultricies leo integer malesuada nunc vel risus commodo. Eget duis at tellus at urna condimentum. Sed cras ornare arcu dui vivamus arcu felis bibendum. Donec et odio pellentesque diam volutpat commodo sed egestas egestas. Gravida dictum fusce ut placerat orci nulla pellentesque dignissim enim. Ultricies tristique nulla aliquet enim tortor at auctor. Faucibus pulvinar elementum integer enim. Massa ultricies mi quis hendrerit dolor magna eget. Lacus vestibulum sed arcu non odio euismod lacinia. Porttitor eget dolor morbi non arcu. Dui ut ornare lectus sit amet. Sodales neque sodales ut etiam sit. Eleifend mi in nulla posuere sollicitudin aliquam. Aenean pharetra magna ac placerat vestibulum lectus mauris ultrices. Mi bibendum neque egestas congue. Elementum nisi quis eleifend quam adipiscing vitae proin sagittis. Faucibus vitae aliquet nec ullamcorper sit amet risus nullam. Dignissim diam quis enim lobortis. Varius duis at consectetur lorem.</InfoBoxText>
  <InfoBoxText>Sed turpis tincidunt id aliquet risus feugiat in ante. Lectus urna duis convallis convallis tellus id interdum velit laoreet. At urna condimentum mattis pellentesque id. Consequat nisl vel pretium lectus quam id leo in vitae. Mattis rhoncus urna neque viverra. In mollis nunc sed id semper risus. Elit ut aliquam purus sit amet luctus venenatis lectus magna. In cursus turpis massa tincidunt dui ut. Et ligula ullamcorper malesuada proin libero nunc consequat. Cursus risus at ultrices mi tempus imperdiet.</InfoBoxText>
  <InfoBoxText>At tellus at urna condimentum. Neque laoreet suspendisse interdum consectetur libero id faucibus. Gravida arcu ac tortor dignissim convallis aenean et tortor at. Bibendum arcu vitae elementum curabitur vitae nunc sed. Quis varius quam quisque id diam vel quam elementum. Nisl condimentum id venenatis a condimentum. Pretium nibh ipsum consequat nisl vel pretium lectus quam. Aliquam nulla facilisi cras fermentum odio eu. Sed euismod nisi porta lorem mollis aliquam ut porttitor leo. Nunc lobortis mattis aliquam faucibus purus in massa tempor nec. Volutpat blandit aliquam etiam erat. Et magnis dis parturient montes nascetur ridiculus mus. Aliquam id diam maecenas ultricies mi eget mauris pharetra. Faucibus ornare suspendisse sed nisi lacus sed viverra. Tellus in metus vulputate eu scelerisque felis imperdiet proin. Ipsum dolor sit amet consectetur adipiscing elit ut. Eros in cursus turpis massa tincidunt dui.</InfoBoxText>
  <InfoBoxText>Nisl nunc mi ipsum faucibus vitae aliquet nec ullamcorper sit. A pellentesque sit amet porttitor eget dolor morbi non arcu. Odio morbi quis commodo odio. Porttitor massa id neque aliquam vestibulum morbi blandit. Cras sed felis eget velit aliquet. Vitae auctor eu augue ut lectus. Morbi tincidunt augue interdum velit euismod. Nulla malesuada pellentesque elit eget gravida cum sociis natoque penatibus. Consequat nisl vel pretium lectus quam id. Enim diam vulputate ut pharetra sit. Odio morbi quis commodo odio aenean sed adipiscing diam. Turpis massa tincidunt dui ut ornare lectus sit amet. Libero volutpat sed cras ornare.</InfoBoxText>  
</InfoBox>
</div>
```



### `<InfoBoxSubhead />` and `<InfoBoxListItem />`

```react
<InfoBox>
  <InfoBoxTitle>This is a box title</InfoBoxTitle>
  <InfoBoxSubhead>
    This is a subhead
  </InfoBoxSubhead>
  <Editorial.UL>
    <InfoBoxListItem>
      <p>He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</p>
    </InfoBoxListItem>
    <InfoBoxListItem>
      <p>The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked.</p>
    </InfoBoxListItem>
    <InfoBoxListItem>
      <p>One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.</p>
    </InfoBoxListItem>
  </Editorial.UL>
    <InfoBoxSubhead>
    This is a subhead
  </InfoBoxSubhead>
  <Editorial.OL>
    <InfoBoxListItem>
      <p>He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</p>
    </InfoBoxListItem>
    <InfoBoxListItem>
      <p>The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked.</p>
    </InfoBoxListItem>
    <InfoBoxListItem>
      <p>One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.</p>
    </InfoBoxListItem>
  </Editorial.OL>
</InfoBox>
```
