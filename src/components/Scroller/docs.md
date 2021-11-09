Scroller is a component that scrolls content vertically. It is used in our `TeaserCarousels` as well as the `Tabs`

Supported props:

- `fullWidth` (bool, false):
- `initialScrollTileIndex`: (number, 0):
- `centered` (bool, false):
- `fullWidth` (bool, false):
- `bgColor` (string, null):
- `color` (string, null)
- `arrowStyle` (string, 'large' | 'small' 'none'):

```react|plain,frame,span-3
<Scroller arrowSize={24} fullWidth hideArrows>
   <IconButton
    Icon={NotificationIcon}
    title="Lesezeichen 1"
    label="Ihre Lesezeichen 1"
    labelShort="Ihre Lesezeichen 1"
  />
  <IconButton
    Icon={NotificationIcon}
    title="Lesezeichen 2"
    label="Ihre Lesezeichen 2"
    labelShort="Ihre Lesezeichen 2"
  />
    <IconButton
    Icon={NotificationIcon}
    title="Lesezeichen 3"
    label="Ihre Lesezeichen 3"
    labelShort="Ihre Lesezeichen 3"
  />
</Scroller>
```


```react|plain,frame,span-3
<Scroller arrowSize={24} fullWidth>
   <IconButton
    Icon={NotificationIcon}
    title="Lesezeichen 1"
    label="Ihre Lesezeichen 1"
    labelShort="Ihre Lesezeichen 1"
  />
  <IconButton
    Icon={NotificationIcon}
    title="Lesezeichen 2"
    label="Ihre Lesezeichen 2"
    labelShort="Ihre Lesezeichen 2"
  />
    <IconButton
    Icon={NotificationIcon}
    title="Lesezeichen 3"
    label="Ihre Lesezeichen 3"
    labelShort="Ihre Lesezeichen 3"
  />
</Scroller>
```