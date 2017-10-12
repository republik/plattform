### `<CommentHeader />`

```react|noSource,span-2
<CommentHeader
  timeago='2h'
  name='Anonym'
/>
```

```react|noSource,span-2
<CommentHeader
  timeago='2h'
  name='Anonym'
  credential={{description: 'Bundesrat', verified: true}}
/>
```

```react|noSource,span-2
<CommentHeader
  timeago='2h'
  profilePicture='/static/profilePicture.png'
  name='Jean Jacques Rousseau'
/>
```

```react|noSource,span-2
<CommentHeader
  timeago='2h'
  profilePicture='/static/profilePicture.png'
  name='Paul Ullrich'
  credential={{description: 'Bundesrat', verified: true}}
/>
```

```react|noSource,span-2
<CommentHeader
  timeago='2h'
  profilePicture='/static/profilePicture.png'
  name='Paul Ullrich'
  credential={{description: 'Bundesrat', verified: false}}
/>
```

### `<CommentActions />`

```react|noSource
<CommentActions
  score={8}

  onAnswer={() => {}}
  onUpvote={() => {}}
  onDownvote={() => {}}
/>
```
