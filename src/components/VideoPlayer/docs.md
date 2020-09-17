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
- `hideTime`: Boolean, hides time and rewind button
- `forceMuted`: Boolean, mutes the player and hides the mute interfaces.
- `cinemagraph`: Boolean, whether the video is a cinemagraph. Forces `loop`, `muted`, `hideTime`, `autoPlay` and `playsInline`.
- `attributes`: Object, arbitrary attributes mapped to the video tag like playsinline, specific ones win

Context:
- `getMediaProgress(props)`: a function that is expected to return a `Promise` of a `Number`. If present it will be called with the component props to retrieve the start time on `componentDidMount` from it.
- `saveMediaProgress(props, HTMLMediaElement)`: will be constantly called during playback if present.

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

#### fullWindow

Force the usage of the full window mode even when fullscreen API is available. This can for example be used when the fullscreen API does not work in a Android web view.

```react|responsive
<Center>
  <VideoPlayer
    src={{
      hls: 'https://player.vimeo.com/external/213080233.m3u8?s=40bdb9917fa47b39119a9fe34b9d0fb13a10a92e',
      mp4: 'https://player.vimeo.com/external/213080233.hd.mp4?s=ab84df0ac9134c86bb68bd9ea7ac6b9df0c35774&profile_id=175',
      thumbnail: `/static/video.jpg`,
      subtitles: '/static/main.vtt'
    }}
    fullWindow
    onFull={(isFull, isFullscreen) => {
      console.log('isFull', isFull, isFullscreen)
    }}
  />
</Center>
```

_`onFull` is fired in the full window and fullscreen case._

#### cinemagraph

Cinemagraphs are still video clips in which minor movement occurs. `isCinemagraph` activates `autoPlay`, `loop`, `playsInline` and `mute` properties and hides the progress bar.

```react
<VideoPlayer
  src={{
    hls: 'https://player.vimeo.com/external/284964492.m3u8?s=870db361c7129f30909d2406713736bf8a167bd9',
    mp4: 'https://player.vimeo.com/external/284964492.hd.mp4?s=3fe867442c31bbcce20a5b7f68f2e3e2f4f69f11&profile_id=175',
    thumbnail: `/static/video.jpg`
  }}
  cinemagraph
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
