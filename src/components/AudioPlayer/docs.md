An `<AudioPlayer />` is a responsive click-to-play audio player.

Props:
- `src`: An object representing the audio's source with these keys:
-- `mp3`: The mandatory mp3 source URL of the audio.
-- `aac`: The aa3 source URL of the audio.
-- `ogg`: The ogg source URL of the audio.
- `size`: optional, `narrow` or `tiny`.
- `attributes`: Object, arbitrary attributes mapped to the audio tag.


```react
<AudioPlayer
  src={{
    mp3: '/static/sample.mp3'
  }}
/>
```

```react
<AudioPlayer
  src={{
    mp3: '/static/sample.mp3'
  }}
  size='narrow'
/>
```


```react
<AudioPlayer
  src={{
    mp3: '/static/sample.mp3'
  }}
  size='tiny'
/>
```

