### `<Comment />`

A `<Comment />` is a combination of `<CommentHeader />` and the comment content. The actions are not part of this component.

```react|noSource,span-4
<Comment
  timeago='2h'
  displayAuthor={{
    profilePicture: '/static/profilePicture.png',
    name: 'Paul Ullrich',
    credential: {description: 'Bundesrat', verified: true}
  }}
  score={8}
  content="This has to be the first time that an author who has written a Fantasy novel (The Buried Giant), is awarded with the Nobel Prize. He has also writted Sci-fi (Never Let Me Go), but Doris Lessing was first there (Shikasta). Wow, I did not expect this one. Don't get me wrong, I *love* his books, but he's way more mainstream than I expected."
/>
```
```react|noSource,span-2
<Comment
  timeago='2h'
  displayAuthor={{
    profilePicture: '/static/profilePicture.png',
    name: 'Paul Ullrich',
    credential: {description: 'Bundesrat', verified: true}
  }}
  score={8}
  content="I don't know. You could just as easily call The Jungle Book fantasy. I also feel like One Hundred Years of Solitude is closer to fantasy than The Buried Giant."
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
