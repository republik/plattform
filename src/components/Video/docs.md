A `<Video />` is a responsive click-to-play video embed.

Props:
- `id`: The video ID.
- `platform`: `youtube` (default) or `vimeo`.
- `title`: The title of the video.
- `thumbnail`: The video thumbnail URL.
- `aspectRatio`: The aspect ratio of the video (float).
- `size`: optional, `narrow` or `tiny`.
- `showMeta`: Whether to show video meta information. If so, provide:
-- `userName`: The user name on the video platform.
-- `userUrl`: The URL of the user on the video platform.
-- `userProfileImageUrl`: The URL of the user's profile image.
-- `date`: The publish date of the video.


```react
<Video
  t={t}
  id='t0nfMr_wXVY'
  platform='youtube'
  url='https://www.youtube.com/watch?v=t0nfMr_wXVY'
  title='Republik: Das Team stellt sich vor'
  thumbnail='https://i.ytimg.com/vi/t0nfMr_wXVY/maxresdefault.jpg'
  aspectRatio={1.7761989342806395}
/>
```

```react
<Video
  t={t}
  id='t0nfMr_wXVY'
  platform='youtube'
  url='https://www.youtube.com/watch?v=t0nfMr_wXVY'
  title='Republik: Das Team stellt sich vor'
  thumbnail='https://i.ytimg.com/vi/t0nfMr_wXVY/maxresdefault.jpg'
  aspectRatio={1.7761989342806395}
  showMeta
  userName='Republik'
  userUrl='https://www.youtube.com/channel/UC82dvTzW_mXuQtw3lIYYCZg'
  userProfileImageUrl='https://yt3.ggpht.com/-ioa9x6qF4KU/AAAAAAAAAAI/AAAAAAAAAAA/f0ivHR9UWTA/s88-c-k-no-mo-rj-c0xffffff/photo.jpg'
  date={new Date(2017, 4, 26)}
/>
```

```react
<Video
  t={t}
  id='214306781'
  platform='vimeo'
  url='https://vimeo.com/214306781'
  title='Viktor Giacobbo unterstützt die Republik'
  thumbnail='https://i.vimeocdn.com/video/632002647_960x960.jpg?r=pad'
  aspectRatio={1}
/>
```

### `<Video />` in context

```react
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <Video
    t={t}
    id='t0nfMr_wXVY'
    platform='youtube'
    url='https://www.youtube.com/watch?v=t0nfMr_wXVY'
    title='Republik: Das Team stellt sich vor'
    thumbnail='https://i.ytimg.com/vi/t0nfMr_wXVY/maxresdefault.jpg'
    aspectRatio={1.7761989342806395}
  />
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <Video
    t={t}
    id='t0nfMr_wXVY'
    platform='youtube'
    url='https://www.youtube.com/watch?v=t0nfMr_wXVY'
    title='Republik: Das Team stellt sich vor'
    thumbnail='https://i.ytimg.com/vi/t0nfMr_wXVY/maxresdefault.jpg'
    aspectRatio={1.7761989342806395}
    size='narrow'
  />
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <Video
    t={t}
    id='t0nfMr_wXVY'
    platform='youtube'
    url='https://www.youtube.com/watch?v=t0nfMr_wXVY'
    title='Republik: Das Team stellt sich vor'
    thumbnail='https://i.ytimg.com/vi/t0nfMr_wXVY/maxresdefault.jpg'
    aspectRatio={1.7761989342806395}
    size='tiny'
  />
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <Video
    t={t}
    id='214306781'
    platform='vimeo'
    url='https://vimeo.com/214306781'
    title='Viktor Giacobbo unterstützt die Republik'
    thumbnail='https://i.vimeocdn.com/video/632002647_960x960.jpg?r=pad'
    aspectRatio={1}
  />
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <Video
    t={t}
    id='214306781'
    platform='vimeo'
    url='https://vimeo.com/214306781'
    title='Viktor Giacobbo unterstützt die Republik'
    thumbnail='https://i.vimeocdn.com/video/632002647_960x960.jpg?r=pad'

    aspectRatio={1}
    size='narrow'
  />
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <Video
    t={t}
    id='214306781'
    platform='vimeo'
    url='https://vimeo.com/214306781'
    title='Viktor Giacobbo unterstützt die Republik'
    thumbnail='https://i.vimeocdn.com/video/632002647_960x960.jpg?r=pad'

    aspectRatio={1}
    size='tiny'
  />
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```
