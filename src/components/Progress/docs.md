A `<ProgressCircle />` represents progress as an arc of a circle. Used in [CommentComposer](/components/commentcomposer#ltcommentcomposer-gt).

Props:
- `progress`: number; the progress from 0 to 100 (default). Negative values appear counter-clockwise.
- `radius`: number; the radius of the circle.
- `stroke`: string; the stroke color.
- `strokeWidth`: number; the stroke width in pixels.
- `strokePlaceholder`: string; the stroke color of the placeholder.

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
  stroke={colors.primary}
  radius={18}
  strokeWidth={2}
/>
```

```react|span-2
<ProgressCircle
  progress={66}
  stroke={colors.primary}
  radius={18}
  strokeWidth={4}
/>
```

```react|span-2
<ProgressCircle
  progress={66}
  stroke={colors.primary}
  radius={18}
  strokeWidth={6}
/>
```

```react|span-2
<ProgressCircle
  progress={-33}
  radius={18}
  strokeWidth={4}
/>
```

```react|span-2
<ProgressCircle
  progress={-66}
  radius={18}
  strokeWidth={4}
/>
```

```react|span-2
<ProgressCircle
  progress={-100}
  radius={18}
  strokeWidth={4}
/>
```

```react|span-2
<ProgressCircle
  progress={33}
  radius={18}
  strokeWidth={4}
  strokePlaceholder={colors.divider}
/>
```

```react|span-2
<ProgressCircle
  progress={66}
  radius={18}
  strokeWidth={4}
  strokePlaceholder={colors.divider}
/>
```

```react|span-2
<ProgressCircle
  progress={100}
  radius={18}
  strokeWidth={4}
  strokePlaceholder={colors.divider}
/>
```
