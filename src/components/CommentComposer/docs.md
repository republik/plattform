### `<CommentComposer />`

```react|noSource,span-4
<CommentComposer
  t={t}
  displayAuthor={{
    name: 'Adrienne Fichter',
    profilePicture: '/static/profilePicture1.png',
    credential: {description: 'Redaktorin', verified: false}
  }}
  onCancel={() => {}}
  submitComment={t => {alert(t)}}
/>
```

```react|noSource,span-2
<CommentComposer
  t={t}
  displayAuthor={{
    name: 'Johann N. Schneider-Ammann',
    profilePicture: '/static/profilePicture1.png',
    credential: {description: 'Bundesrat', verified: true}
  }}
  onCancel={() => {}}
  submitComment={t => {alert(t)}}
/>
```

### `<CommentComposerHeader />`

Almost like `<CommentHeader />` but with a button on the right.

```react|noSource
<CommentComposerHeader
  {...{
    name: 'Ueli Maurer',
    profilePicture: '/static/profilePicture1.png',
    credential: {description: 'Bundesrat', verified: false}
  }}
/>
```

### `<CommentComposerPlaceholder />`

Same height as `<CommentComposerHeader />` so that it can be used in its place and we can have a nice transition between the placeholder and the whole `<CommentComposer />` component.

```react|noSource,span-3
<CommentComposerPlaceholder
  t={t}
  profilePicture='/static/profilePicture1.png'
  onClick={() => {}}
/>
```
```react|noSource,span-3
<CommentComposerPlaceholder
  t={t}
  onClick={() => {}}
/>
```
