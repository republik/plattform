### `<CommentComposer />`

```react|noSource,plain,span-2
<CommentComposer
  t={t}
  displayAuthor={{
    name: 'Adrienne Fichter',
    profilePicture: '/static/profilePicture1.png',
    credential: {description: 'Redaktorin', verified: false}
  }}
  onEditPreferences={() => {}}
  onCancel={() => {}}
  submitComment={t => {alert(t)}}
  submitLabel={t('styleguide/CommentComposer/answer')}
/>
```

```react|noSource,plain,span-2
<CommentComposer
  t={t}
  displayAuthor={{
    name: 'Johann N. Schneider-Ammann',
    profilePicture: '/static/profilePicture1.png',
    credential: {description: 'Bundesrat', verified: true}
  }}
  onEditPreferences={() => {}}
  onCancel={() => {}}
  submitComment={t => {alert(t)}}
/>
```

```react|noSource,plain,span-2
<CommentComposer
  t={t}
  initialText='Die Kranken'
  displayAuthor={{
    name: 'Johann N. Schneider-Ammann',
    profilePicture: '/static/profilePicture1.png',
    credential: {description: 'Bundesrat', verified: true}
  }}
  onEditPreferences={() => {}}
  onCancel={() => {}}
  submitComment={t => {alert(t)}}
  submitLabel='bearbeiten'
/>
```

```react|noSource,plain,span-2
<CommentComposer
  t={t}
  initialText='Als Gregor Samsa eines Morgens aus unruhigen Träumen erwachte, '
  displayAuthor={{
    name: 'Christof Moser',
    profilePicture: '/static/profilePicture1.png',
    credential: {description: 'Journalist', verified: true}
  }}
  onEditPreferences={() => {}}
  onCancel={() => {}}
  submitComment={t => {alert(t)}}
  limit={100}
/>
```

```react|noSource,plain,span-2
<CommentComposer
  t={t}
  initialText='Als Gregor Samsa eines Morgens aus unruhigen Träumen erwachte, fand er sich in seinem '
  displayAuthor={{
    name: 'Christof Moser',
    profilePicture: '/static/profilePicture1.png',
    credential: {description: 'Journalist', verified: true}
  }}
  onEditPreferences={() => {}}
  onCancel={() => {}}
  submitComment={t => {alert(t)}}
  limit={100}
/>
```

```react|noSource,plain,span-2
<CommentComposer
  t={t}
  initialText='Als Gregor Samsa eines Morgens aus unruhigen Träumen erwachte, fand er sich in seinem Bett zu einem ungeheueren Ungeziefer verwandelt. '
  displayAuthor={{
    name: 'Christof Moser',
    profilePicture: '/static/profilePicture1.png',
    credential: {description: 'Journalist', verified: true}
  }}
  onEditPreferences={() => {}}
  onCancel={() => {}}
  submitComment={t => {alert(t)}}
  limit={100}
/>
```

### `<CommentComposerHeader />`

Almost like `<CommentHeader />` but with a button on the right.

```react|noSource,plain
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

```react|noSource,plain,span-3
<CommentComposerPlaceholder
  t={t}
  profilePicture='/static/profilePicture1.png'
  onClick={() => {}}
/>
```
```react|noSource,plain,span-3
<CommentComposerPlaceholder
  t={t}
  onClick={() => {}}
/>
```

### `<CommentComposerError />`

The error message that is shown below the `<CommentComposer />` if creating the comment has failed. Set the `error` prop on `<CommentComposer />` to display the message.

```react|noSource,plain
<CommentComposerError>
  Sie sind zu früh. Bitte warten Sie, 161.446s bevor Sie wieder kommentieren.
</CommentComposerError>
```

```react|noSource,plain
<CommentComposer
  t={t}
  displayAuthor={{
    name: 'Adrienne Fichter',
    profilePicture: '/static/profilePicture1.png',
    credential: {description: 'Redaktorin', verified: false}
  }}
  error='Sie sind zu früh. Bitte warten Sie, 161.446s bevor Sie wieder kommentieren.'
  onEditPreferences={() => {}}
  onCancel={() => {}}
  submitComment={t => {alert(t)}}
/>
```
