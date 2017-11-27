### `<Figure />`

A `<Figure />` typically contains an `<FigureImage>` and an optional `<FigureCaption>`. The `<FigureImage>` component makes sure that the image doesn't exceed the container width when using a large image.

```react
<Figure>
  <FigureImage data={{src: '/static/landscape.jpg', alt: ''}} />
  <FigureCaption>
    Lorem ipsum dolor sit amet consetetur.{' '}
    <FigureByline>Photo: Laurent Burst</FigureByline>
  </FigureCaption>
</Figure>
```

#### `size`

Supports `breakout` sizes:

```react|responsive
<Center style={{backgroundColor: 'red'}}>
  <Figure size='breakout'>
    <FigureImage data={{src: '/static/landscape.jpg', alt: ''}} />
    <FigureCaption>
      Lorem ipsum dolor sit amet consetetur.{' '}
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
</Center>
```

### `<FigureGroup />`

A `<FigureGroup />` arranges multiple `<Figure />` elements in columns. Use the `columns` prop to specify `2` to `4` columns, defaults to `2`. There's no auto-cropping magic in place, so image files should already be cropped to the same aspect ratio.

A `<FigureGroup />` containing two side-by-side `<Figure>` elements, each with their own caption:

```react
<FigureGroup>
  <Figure>
    <FigureImage data={{src: '/static/landscape.jpg', alt: ''}} />
    <FigureCaption>
      A caption for the left photo.{' '}
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <Figure>
    <FigureImage data={{src: '/static/landscape.jpg', alt: ''}} />
    <FigureCaption>
      A caption for the right photo.{' '}
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
</FigureGroup>
```

A `<FigureGroup />` containing two side-by-side `<Figure>` elements, with one shared caption:

```react
<FigureGroup>
  <Figure>
    <FigureImage data={{src: '/static/landscape.jpg', alt: ''}} />
  </Figure>
  <Figure>
    <FigureImage data={{src: '/static/landscape.jpg', alt: ''}} />
  </Figure>
  <FigureCaption>
    This is an image caption stretching beautifully over both images as you can see above.{' '}
    <FigureByline>Photos: Laurent Burst</FigureByline>
  </FigureCaption>
</FigureGroup>
```

A `<FigureGroup />` containing three side-by-side `<Figure>` elements:
```react
<FigureGroup columns={3}>
  <Figure>
    <FigureImage data={{src: '/static/landscape.jpg', alt: ''}} />
    <FigureCaption>
      Left photo.{' '}
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <Figure>
    <FigureImage data={{src: '/static/landscape.jpg', alt: ''}} />
    <FigureCaption>
      Center photo.{' '}
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <Figure>
    <FigureImage data={{src: '/static/landscape.jpg', alt: ''}} />
    <FigureCaption>
      Right photo.{' '}
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
</FigureGroup>
```

A `<FigureGroup />` containing four side-by-side `<Figure>` elements:
```react
<FigureGroup columns={4}>
  <Figure>
    <FigureImage data={{src: '/static/landscape.jpg', alt: ''}} />
    <FigureCaption>
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <Figure>
    <FigureImage data={{src: '/static/landscape.jpg', alt: ''}} />
    <FigureCaption>
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <Figure>
    <FigureImage data={{src: '/static/landscape.jpg', alt: ''}} />
    <FigureCaption>
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <Figure>
    <FigureImage data={{src: '/static/landscape.jpg', alt: ''}} />
    <FigureCaption>
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
</FigureGroup>
```

A `<FigureGroup />` containing four `<Figure>` elements in two columns:
```react
<FigureGroup>
  <Figure>
    <FigureImage data={{src: '/static/landscape.jpg', alt: ''}} />
    <FigureCaption>
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <Figure>
    <FigureImage data={{src: '/static/landscape.jpg', alt: ''}} />
    <FigureCaption>
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <Figure>
    <FigureImage data={{src: '/static/landscape.jpg', alt: ''}} />
    <FigureCaption>
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <Figure>
    <FigureImage data={{src: '/static/landscape.jpg', alt: ''}} />
    <FigureCaption>
      <FigureByline>Photo: Laurent Burst</FigureByline>
    </FigureCaption>
  </Figure>
  <FigureCaption>
    This is a caption stretching beautifully across the group of all images as you can see above.
  </FigureCaption>
</FigureGroup>
```


#### `size`

Supports `breakout` sizes:

```react|responsive
<Center style={{backgroundColor: 'red'}}>
  <FigureGroup size='breakout'>
    <Figure>
      <FigureImage data={{src: '/static/landscape.jpg', alt: ''}} />
    </Figure>
    <Figure>
      <FigureImage data={{src: '/static/landscape.jpg', alt: ''}} />
    </Figure>
    <FigureCaption>
      This is an image caption stretching beautifully over both images as you can see above.{' '}
      <FigureByline>Photos: Laurent Burst</FigureByline>
    </FigureCaption>
  </FigureGroup>
</Center>
```

