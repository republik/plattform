An `<AudioPlayer />` is a responsive click-to-play audio player.

Props:
- `src`: An object representing the audio's source with these keys:
-- `mp3`: The mp3 source URL of the audio.
-- `aac`: The aac source URL of the audio.
-- `ogg`: The ogg source URL of the audio.
-- `hls`: The hls source URL (when using a video).
-- `mp4`: The mp4 source URL (when using a video).
- `size`: optional, `narrow` or `tiny`.
- `attributes`: Object, arbitrary attributes mapped to the audio tag.
- `download`: Whether to display a download icon.
- `scrubberPosition`: `top` (default) or `bottom`.
- `timePosition`: `right` (default) or `left`.
- `controlsPadding`: The horizontal padding between controls and container, defaults to 0


```react
<AudioPlayer
  src={{
    mp3: 'https://cdn.republik.space/s3/republik-assets/assets/audio-artikel/republik_diktator_fichter.mp3'
  }}
  t={t}
/>
```

```react
<AudioPlayer
  src={{
    mp3: 'https://cdn.republik.space/s3/republik-assets/assets/audio-artikel/republik_diktator_fichter.mp3'
  }}
  timePosition='left'
  t={t}
/>
```

```react
<AudioPlayer
  src={{
    mp3: 'https://cdn.republik.space/s3/republik-assets/assets/audio-artikel/republik_diktator_fichter.mp3'
  }}
  download
  scrubberPosition='bottom'
  t={t}
/>
```

```react
<AudioPlayer
  src={{
    mp3: 'https://cdn.republik.space/s3/republik-assets/assets/audio-artikel/republik_diktator_fichter.mp3'
  }}
  download
  scrubberPosition='bottom'
  height={100}
  controlsPadding={50}
  style={{backgroundColor: '#fff', borderTop: '1px solid #eee'}}
  t={t}
/>
```

```react
<AudioPlayer
  src={{
    mp3: 'https://cdn.republik.space/s3/republik-assets/assets/audio-artikel/republik_diktator_fichter.mp3'
  }}
  download
  scrubberPosition='bottom'
  timePosition='left'
  height={100}
  controlsPadding={50}
  style={{backgroundColor: '#fff', borderTop: '1px solid #eee'}}
  t={t}
/>
```

```react
<AudioPlayer
  src={{
    mp3: '/static/non-existing-sample.mp3'
  }}
  download
  scrubberPosition='bottom'
  timePosition='left'
  height={100}
  controlsPadding={50}
  style={{backgroundColor: '#fff', borderTop: '1px solid #eee'}}
  t={t}
/>
```

```react
<AudioPlayer
  src={{
    mp3: 'https://cdn.republik.space/s3/republik-assets/assets/audio-artikel/republik_diktator_fichter.mp3'
  }}
  size='narrow'
  t={t}
/>
```

```react
<AudioPlayer
  src={{
    mp3: 'https://cdn.republik.space/s3/republik-assets/assets/audio-artikel/republik_diktator_fichter.mp3'
  }}
  size='tiny'
  t={t}
/>
```

```react
<AudioPlayer
  src={{
    mp3: '/static/non-existing-sample.mp3'
  }}
  t={t}
/>
```

```react
<AudioPlayer
  src={{
    mp3: '/static/non-existing-sample.mp3'
  }}
  t={t}
  timePosition='left'
/>
```

```react
<AudioPlayer
  src={{
    mp3: '/static/non-existing-sample.mp3'
  }}
  t={t}
  download
  scrubberPosition='bottom'
/>
```

The `<AudioPlayer />` may also be used to play from video sources when visual content doesn't matter.

```react
<AudioPlayer
  src={{
    hls: 'https://player.vimeo.com/external/213080233.m3u8?s=40bdb9917fa47b39119a9fe34b9d0fb13a10a92e',
    mp4: 'https://player.vimeo.com/external/213080233.hd.mp4?s=ab84df0ac9134c86bb68bd9ea7ac6b9df0c35774&profile_id=175',
  }}
  t={t}
/>
```

```react
<AudioPlayer
  src={{
    hls: 'https://player.vimeo.com/external/213080233.m3u8?s=40bdb9917fa47b39119a9fe34b9d0fb13a10a92e'
  }}
  t={t}
/>
```

```react
<AudioPlayer
  src={{
    mp4: 'https://player.vimeo.com/external/213080233.hd.mp4?s=ab84df0ac9134c86bb68bd9ea7ac6b9df0c35774&profile_id=175'
  }}
  t={t}
/>
```
