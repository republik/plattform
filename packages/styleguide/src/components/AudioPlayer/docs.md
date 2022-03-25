An `<AudioPlayer />` is a responsive click-to-play audio player.

Props:

- `mode`: string, `inline` (default) or `overlay`. Determines the style of player. Overlay players include an expanded mode and support additional features, like setting the playback rate.
- `src`: An object (required) representing the audio's source with these keys:
  -- `mp3`: The mp3 source URL of the audio.
  -- `aac`: The aac source URL of the audio.
  -- `ogg`: The ogg source URL of the audio.
  -- `hls`: The hls source URL (when using a video).
  -- `mp4`: The mp4 source URL (when using a video).
- `autoPlay`: Boolean (optional), trigger play once after the source and context start time is ready
- `attributes`: Object, arbitrary attributes mapped to the audio tag.
- `t`: translate function
- `height`: number, The player height in pixels, defaults to 44 in the inline and 68 in overlay mode.
- `closeHandler`: Function, optional for `inline` mode, required for `overlay` mode. Displays a close icon on the player in `inline` mode (wich is always present in the `overlay` mode), calls the handler on click.
- `download`: Whether to display a download icon.

Overlay mode specific props:
- `sourcePath`: sting (required): path of the article the auio files is embedded in.
- `title`: sting (required): title of the audiofile.

Inline mode speficic props:
- `scrubberPosition`: string (optional), `top` (default) or `bottom`.
- `timePosition`: string (optional), `right` (default) or `left`.
- `controlsPadding`: number (optional),  The horizontal padding between controls and container, defaults to 0.
- `style`: style (optional), styles applied to the outer most container of the player.
- `size`: string (optional) = 'narow' | 'tiny | 'breakout', see breakoutStyles object for more info.

Context:

- `getMediaProgress(props)`: a function that is expected to return a `Promise` of a `Number`. If present it will be called with the component props to retrieve the start time on `componentDidMount` from it.
- `saveMediaProgress(props, HTMLMediaElement)`: will be constantly called during playback if present.

### Overlay Player

```react|responsive
<div
  style={{
    position: 'fixed',
    width: '100%',
    maxWidth: 414,
    bottom: 44,
    right: 0,
    padding: '0 16px',
    zIndex: 50,
    transition: 'all ease-out 0.3s',
}}>
  <div style={{backgroundColor: 'white', boxShadow: '0 0 15px rgba(0,0,0,0.1)'}}>
    <AudioPlayer
      src={{
        mp3: 'https://cdn.repub.ch/s3/republik-assets/assets/audio-artikel/republik_diktator_fichter.mp3'
      }}
      mode='overlay'
      download
      title='Vier Schriftstellerinnen schildern die jahrelange russische Bedrohung der Ukraine. Dazu: Der Wochenkommentar und eine neue Podcast-Folge.'
      t={t}
    />
  </div>
</div>
```

### Inline Player

```react
<AudioPlayer
  src={{
    mp3: 'https://cdn.repub.ch/s3/republik-assets/assets/audio-artikel/republik_diktator_fichter.mp3'
  }}
  t={t}
/>
```

```react
<AudioPlayer
  src={{
    mp3: 'https://cdn.repub.ch/s3/republik-assets/assets/audio-artikel/republik_diktator_fichter.mp3'
  }}
  timePosition='left'
  t={t}
/>
```

```react
<AudioPlayer
  src={{
    mp3: 'https://cdn.repub.ch/s3/republik-assets/assets/audio-artikel/republik_diktator_fichter.mp3'
  }}
  download
  scrubberPosition='bottom'
  t={t}
/>
```

```react
<AudioPlayer
  src={{
    mp3: 'https://cdn.repub.ch/s3/republik-assets/assets/audio-artikel/republik_diktator_fichter.mp3'
  }}
  closeHandler={() => {console.log('Close button clicked')}}
  download
  scrubberPosition='bottom'
  t={t}
/>
```

```react
<AudioPlayer
  src={{
    mp3: 'https://cdn.repub.ch/s3/republik-assets/assets/audio-artikel/republik_diktator_fichter.mp3'
  }}
  closeHandler={() => {console.log('Close button clicked')}}
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
    mp3: 'https://cdn.repub.ch/s3/republik-assets/assets/audio-artikel/republik_diktator_fichter.mp3'
  }}
  closeHandler={() => {console.log('Close button clicked')}}
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
  closeHandler={() => {console.log('Close button clicked')}}
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
    mp3: 'https://cdn.repub.ch/s3/republik-assets/assets/audio-artikel/republik_diktator_fichter.mp3'
  }}
  size='narrow'
  t={t}
/>
```

```react
<AudioPlayer
  src={{
    mp3: 'https://cdn.repub.ch/s3/republik-assets/assets/audio-artikel/republik_diktator_fichter.mp3'
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
  closeHandler={() => {console.log('Close button clicked')}}
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
