### `<Comment />`

A `<Comment />` is a combination of `<CommentHeader />` and the comment content. The actions are not part of this component.

```react|noSource,span-4
<Comment
  timeago='2h'
  displayAuthor={{
    profilePicture: '/static/profilePicture1.png',
    name: 'Christof Moser',
    credential: {description: 'Journalist', verified: true}
  }}
  score={8}
  content="Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. "
/>
```
```react|noSource,span-2
<Comment
  timeago='2h'
  displayAuthor={{
    profilePicture: '/static/profilePicture1.png',
    name: 'Christof Moser',
    credential: {description: 'Bundesrat', verified: false}
  }}
  score={8}
  content="Er versuchte, sich in der Dunkelheit seinen Weg zu ertasten und erstarrte: Anscheinend gab es keinen anderen Ausweg aus diesem kleinen Hof als den Durchgang, durch den er gekommen war."
/>
```

### `<CommentHeader />`

The profile picture in the `<CommentHeader />` has a white border so that we can place a vertical line underneath when this component is used in a `CommentTree`.

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
  credential={{description: 'Journalist', verified: true}}
/>
```

```react|noSource,span-2
<CommentHeader
  timeago='2h'
  profilePicture='/static/profilePicture1.png'
  name='Christof Moser'
/>
```

```react|noSource,span-2
<CommentHeader
  timeago='2h'
  profilePicture='/static/profilePicture1.png'
  name='Christof Moser'
  credential={{description: 'Journalist', verified: true}}
/>
```

```react|noSource,span-2
<CommentHeader
  timeago='2h'
  profilePicture='/static/profilePicture1.png'
  name='Christof Moser'
  credential={{description: 'Bundesrat', verified: false}}
/>
```

### `<CommentActions />`

```react|noSource,span-2
<CommentActions
  t={() => 'Antworten'}

  score={8}

  onAnswer={undefined}
  onUpvote={undefined}
  onDownvote={undefined}
/>
```
```react|noSource,span-2
<CommentActions
  t={() => 'Antworten'}

  score={8}

  onAnswer={() => {}}
  onUpvote={undefined}
  onDownvote={() => {}}
/>
```
```react|noSource,span-2
<CommentActions
  t={() => 'Antworten'}

  score={8}

  onAnswer={() => {}}
  onUpvote={() => {}}
  onDownvote={() => {}}
/>
```
