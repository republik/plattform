### `<Figure />`

A `<Figure />` typically contains an `<Image>` and an optional `<Caption>`. The `<Image>` component makes sure that the image doesn't exceed the container width when using a large image.

```react
<Figure>
  <Image data={{src: '/static/landscape.jpg', alt: ''}} />
  <Caption>
    Lorem ipsum dolor sit amet consetetur.{' '}
    <Byline>Photo: Laurent Burst</Byline>
  </Caption>
</Figure>
```

#### `size`

Supports `breakout` sizes:

```react|responsive
<Center style={{backgroundColor: 'red'}}>
  <Figure size='breakout'>
    <Image data={{src: '/static/landscape.jpg', alt: ''}} />
    <Caption>
      Lorem ipsum dolor sit amet consetetur.{' '}
      <Byline>Photo: Laurent Burst</Byline>
    </Caption>
  </Figure>
</Center>
```

### `<FigureGroup />`

A `<FigureGroup />` arranges multiple `<Figure />` elements in columns. Use the `columns` prop to specify `2` to `4` columns, defaults to `2`. There's no auto-cropping magic in place, so image files should already be cropped to the same aspect ratio.

A `<FigureGroup />` containing two side-by-side `<Figure>` elements, each with their own caption:

```react
<FigureGroup>
  <Figure>
    <Image data={{src: '/static/landscape.jpg', alt: ''}} />
    <Caption>
      A caption for the left photo.{' '}
      <Byline>Photo: Laurent Burst</Byline>
    </Caption>
  </Figure>
  <Figure>
    <Image data={{src: '/static/landscape.jpg', alt: ''}} />
    <Caption>
      A caption for the right photo.{' '}
      <Byline>Photo: Laurent Burst</Byline>
    </Caption>
  </Figure>
</FigureGroup>
```

A `<FigureGroup />` containing two side-by-side `<Figure>` elements, with one shared caption:

```react
<FigureGroup>
  <Figure>
    <Image data={{src: '/static/landscape.jpg', alt: ''}} />
  </Figure>
  <Figure>
    <Image data={{src: '/static/landscape.jpg', alt: ''}} />
  </Figure>
  <Caption>
    This is an image caption stretching beautifully over both images as you can see above.{' '}
    <Byline>Photos: Laurent Burst</Byline>
  </Caption>
</FigureGroup>
```

A `<FigureGroup />` containing three side-by-side `<Figure>` elements:
```react
<FigureGroup columns={3}>
  <Figure>
    <Image data={{src: '/static/landscape.jpg', alt: ''}} />
    <Caption>
      Left photo.{' '}
      <Byline>Photo: Laurent Burst</Byline>
    </Caption>
  </Figure>
  <Figure>
    <Image data={{src: '/static/landscape.jpg', alt: ''}} />
    <Caption>
      Center photo.{' '}
      <Byline>Photo: Laurent Burst</Byline>
    </Caption>
  </Figure>
  <Figure>
    <Image data={{src: '/static/landscape.jpg', alt: ''}} />
    <Caption>
      Right photo.{' '}
      <Byline>Photo: Laurent Burst</Byline>
    </Caption>
  </Figure>
</FigureGroup>
```

A `<FigureGroup />` containing four side-by-side `<Figure>` elements:
```react
<FigureGroup columns={4}>
  <Figure>
    <Image data={{src: '/static/landscape.jpg', alt: ''}} />
    <Caption>
      <Byline>Photo: Laurent Burst</Byline>
    </Caption>
  </Figure>
  <Figure>
    <Image data={{src: '/static/landscape.jpg', alt: ''}} />
    <Caption>
      <Byline>Photo: Laurent Burst</Byline>
    </Caption>
  </Figure>
  <Figure>
    <Image data={{src: '/static/landscape.jpg', alt: ''}} />
    <Caption>
      <Byline>Photo: Laurent Burst</Byline>
    </Caption>
  </Figure>
  <Figure>
    <Image data={{src: '/static/landscape.jpg', alt: ''}} />
    <Caption>
      <Byline>Photo: Laurent Burst</Byline>
    </Caption>
  </Figure>
</FigureGroup>
```

A `<FigureGroup />` containing four `<Figure>` elements in two columns:
```react
<FigureGroup>
  <Figure>
    <Image data={{src: '/static/landscape.jpg', alt: ''}} />
    <Caption>
      <Byline>Photo: Laurent Burst</Byline>
    </Caption>
  </Figure>
  <Figure>
    <Image data={{src: '/static/landscape.jpg', alt: ''}} />
    <Caption>
      <Byline>Photo: Laurent Burst</Byline>
    </Caption>
  </Figure>
  <Figure>
    <Image data={{src: '/static/landscape.jpg', alt: ''}} />
    <Caption>
      <Byline>Photo: Laurent Burst</Byline>
    </Caption>
  </Figure>
  <Figure>
    <Image data={{src: '/static/landscape.jpg', alt: ''}} />
    <Caption>
      <Byline>Photo: Laurent Burst</Byline>
    </Caption>
  </Figure>
  <Caption>
    This is a caption stretching beautifully across the group of all images as you can see above.
  </Caption>
</FigureGroup>
```


#### `size`

Supports `breakout` sizes:

```react|responsive
<Center style={{backgroundColor: 'red'}}>
  <FigureGroup size='breakout'>
    <Figure>
      <Image data={{src: '/static/landscape.jpg', alt: ''}} />
    </Figure>
    <Figure>
      <Image data={{src: '/static/landscape.jpg', alt: ''}} />
    </Figure>
    <Caption>
      This is an image caption stretching beautifully over both images as you can see above.{' '}
      <Byline>Photos: Laurent Burst</Byline>
    </Caption>
  </FigureGroup>
</Center>
```

