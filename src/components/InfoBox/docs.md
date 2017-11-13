An `<InfoBox />` features informational content interspersed into the main editorial content.

Supported props:
- `source`: The source or author of the quote.
- `imageSrc`: An image.
- `float`: Enforce floating image on desktop. On mobile the image floats, while on desktop the image is rendered in a 2-column layout.
- `imageSize`: The image size, `S` (default), `M` or `L`.
- `byline`: The by-line to render underneath the image.


```react
<InfoBox title='This is a box title'>
  One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought.
</InfoBox>
```

```react
<InfoBox
  title='This is a box title'
  imageSrc='/static/landscape.jpg'
  byline={'Photo: Laurent Burst'}>
  One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.
</InfoBox>
```

```react
<InfoBox
  title='This is a box title'
  imageSrc='/static/landscape.jpg'
  byline={'Photo: Laurent Burst'}
  float>
  One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.
</InfoBox>
```

```react
<InfoBox title='This is a box title'
  imageSize={'M'}
  imageSrc='/static/landscape.jpg'
  byline={'Photo: Laurent Burst'}>
  One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.
</InfoBox>
```

```react
<InfoBox title='This is a box title'
  imageSize={'L'}
  imageSrc='/static/landscape.jpg'
  byline={'Photo: Laurent Burst'}>
  One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me?" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.
</InfoBox>
```
