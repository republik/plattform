A `<ProgressCircle />` represents progress as an arc of a circle. Used in [CommentComposer](/components/commentcomposer#ltcommentcomposer-gt).

Props:
- `progress`: number; the progress from 0 to 100 (default). Negative values appear counter-clockwise.
- `size`: number; the desired size of the element (including padding, which is 1/6th to be consistent with material icons).
- `strokeColorName`: string; the stroke color name.
- `strokeWidth`: number; the stroke width in pixels.
- `strokePlaceholder`: boolean; adds palceholder stroke

```react|span-2
<ProgressCircle
  progress={33}
/>
```

```react|span-2
<ProgressCircle
  progress={66}
/>
```

```react|span-2
<ProgressCircle
  progress={100}
/>
```

```react|span-2
<ProgressCircle
  progress={66}
  strokeColorName="primary"
  size={36}
  strokeWidth={2}
/>
```

```react|span-2
<ProgressCircle
  progress={66}
  strokeColorName="primary"
  size={36}
  strokeWidth={4}
/>
```

```react|span-2
<ProgressCircle
  progress={66}
  strokeColorName="primary"
  size={36}
  strokeWidth={6}
/>
```

```react|span-2
<ProgressCircle
  progress={-33}
  size={36}
  strokeWidth={4}
/>
```

```react|span-2
<ProgressCircle
  progress={-66}
  size={36}
  strokeWidth={4}
/>
```

```react|span-2
<ProgressCircle
  progress={-100}
  size={36}
  strokeWidth={4}
/>
```

```react|span-2
<ProgressCircle
  progress={33}
  size={36}
  strokeWidth={4}
  strokePlaceholder
/>
```

```react|span-2
<ProgressCircle
  progress={66}
  size={36}
  strokeWidth={4}
  strokePlaceholder
/>
```

```react|span-2
<ProgressCircle
  progress={100}
  size={36}
  strokeWidth={4}
  strokePlaceholder
/>
```
