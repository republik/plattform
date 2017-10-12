### `<Comment />`

A `<Comment />` is a combination of `<CommentHeader />` and the comment content. The actions are not part of this component.

```react|noSource
<Comment
  timeago='2h'
  displayAuthor={{
    profilePicture: '/static/profilePicture.png',
    name: 'Paul Ullrich',
    credential: {description: 'Bundesrat', verified: true}
  }}
  score={8}
  content='Ihr könnt ruhig über den Film Shades of Grey herziehen. Aber Mr. Grey ist verdammt heiss.'
/>
```

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
