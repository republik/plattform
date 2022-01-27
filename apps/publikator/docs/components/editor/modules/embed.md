# Embed Module

## `embedVideo`

Allows pasting of URL's that point to external resources of:
* Youtube
* Vimeo

Example of template rule:
```
{
  matchMdast: matchZone('EMBEDVIDEO'),
  component: MyVideoComponent,
  editorModule: 'embedVideo',
  editorOptions: {
    lookupType: 'paragraph'
  }
}
```

Notable props:
* `editorOptions.lookupType` - Slate element that should get searched for Embed URL'.

The render component gets passed a `data` property containing an object
```
{
  "__typename": "YoutubeEmbed",
  "id": "2lXD0vv-ds8",
  "createdAt": "2014-10-02T00:00:02.000Z",
  "userId": "UCj3NRzD4qFJ-zN2iPeF_fMg",
  "userName": "FlyingLotusVEVO",
  "thumbnail": "https://i.ytimg.com/vi/2lXD0vv-ds8/sddefault.jpg"
}
```
...where `__typename` can be either `"YoutubeEmbed"` or `"VimeoEmbed"`.


## `embedTwitter`

Allows pasting of URL's that point to Tweets aka Twitter "statuses"

Example of template rule:
```
{
  matchMdast: matchZone('EMBEDTWITTER'),
  component: MyTweetComponent,
  editorModule: 'embedTwitter',
  editorOptions: {
    lookupType: 'paragraph'
  }
}
```

Notable props:
* `editorOptions.lookupType` - Slate element that should get searched for Embed URL'.

The render component gets passed a `data` property containing an object
```
{
  "__typename": "TwitterEmbed",
  "id": "931185360972824583",
  "text": "🗓️ November 16, 2002: @ThierryHenry at his brilliant, brilliant best\n\nWhat. A. Goal. 🙌\n\n#AFCvTHFC 🔴 https://t.co/LQf3AFREYb",
  "createdAt": "Thu Nov 16 15:41:05 +0000 2017",
  "userId": "34613288",
  "userName": "Arsenal FC",
  "userScreenName": "Arsenal"
}
```

## TODO
* Define the actual keys that are necessary for the frontend components.
* Find a way to define the lookupType based on a module type rather than plain type.
* Allow for multiple lookupTypes.
