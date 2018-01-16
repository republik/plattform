A `<VideoPlayer />` is a responsive click-to-play video player.

Props:
- `src`: An object representing the video's source with these keys:
-- `hls`: The mandatory hls source URL of the video.
-- `mp4`: The mandatory mp4 source URL of the video.
-- `thumbnail`: The mandatory URL of the thumbnail shown before the video is playing.
-- `subtitles`: The optional URL of the subtitles file.
- `size`: optional, `narrow` or `tiny`.
- `showPlay`: Whether to show the play button, defaults to `true`
- `autoPlay`: Boolean, mapped to the video tag
- `loop`: Boolean, mapped to the video tag
- `attributes`: Object, arbitrary attributes mapped to the video tag like playsinline, specific ones win


```react
<VideoPlayer
  src={{
    hls: 'https://player.vimeo.com/external/213080233.m3u8?s=40bdb9917fa47b39119a9fe34b9d0fb13a10a92e',
    mp4: 'https://player.vimeo.com/external/213080233.hd.mp4?s=ab84df0ac9134c86bb68bd9ea7ac6b9df0c35774&profile_id=175',
    thumbnail: `/static/video.jpg`,
    subtitles: '/static/main.vtt'
  }}
/>
```

#### showPlay `false`

```react
<VideoPlayer
  src={{
    hls: 'https://player.vimeo.com/external/213080233.m3u8?s=40bdb9917fa47b39119a9fe34b9d0fb13a10a92e',
    mp4: 'https://player.vimeo.com/external/213080233.hd.mp4?s=ab84df0ac9134c86bb68bd9ea7ac6b9df0c35774&profile_id=175',
    thumbnail: `/static/video.jpg`,
    subtitles: '/static/main.vtt'
  }}
  showPlay={false}
/>
```

#### forceMuted

Generally the player manages its own global muted state but you can overwrite it with `forceMuted`. This also hides the mute interfaces.

```react
<VideoPlayer
  src={{
    hls: 'https://player.vimeo.com/external/250999239.m3u8?s=54d7c0e48ea4fcf914cfb34c580081f544618da2',
    mp4: 'https://player.vimeo.com/external/250999239.hd.mp4?s=7d6d2504261c5341158efe3d882a71eb23381302&profile_id=174',
    thumbnail: `/static/video.jpg`,
    subtitles: '/static/main.vtt'
  }}
  loop
  autoPlay
  forceMuted
/>
```

### `<VideoPlayer />` in context

```react
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <VideoPlayer
    src={{
      hls: 'https://player.vimeo.com/external/213080233.m3u8?s=40bdb9917fa47b39119a9fe34b9d0fb13a10a92e',
      mp4: 'https://player.vimeo.com/external/213080233.hd.mp4?s=ab84df0ac9134c86bb68bd9ea7ac6b9df0c35774&profile_id=175',
      thumbnail: `/static/video.jpg`,
      subtitles: '/static/main.vtt'
    }}
  />
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <VideoPlayer
    src={{
      hls: 'https://player.vimeo.com/external/213080233.m3u8?s=40bdb9917fa47b39119a9fe34b9d0fb13a10a92e',
      mp4: 'https://player.vimeo.com/external/213080233.hd.mp4?s=ab84df0ac9134c86bb68bd9ea7ac6b9df0c35774&profile_id=175',
      thumbnail: `/static/video.jpg`,
      subtitles: '/static/main.vtt'
    }}
    size='narrow'
  />
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```

```react
<Center>
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
  <VideoPlayer
    src={{
      hls: 'https://player.vimeo.com/external/213080233.m3u8?s=40bdb9917fa47b39119a9fe34b9d0fb13a10a92e',
      mp4: 'https://player.vimeo.com/external/213080233.hd.mp4?s=ab84df0ac9134c86bb68bd9ea7ac6b9df0c35774&profile_id=175',
      thumbnail: `/static/video.jpg`,
      subtitles: '/static/main.vtt'
    }}
    size='tiny'
  />
  <Editorial.P>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores.</Editorial.P>
</Center>
```
