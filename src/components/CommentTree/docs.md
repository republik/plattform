These are the relevant types which are used by the `<Node />` component:

```code|lang-js
type NodeProps = {
  // The translation function.
  t(…): string

  // The current user, this is passed to the comment composer
  // when the user opens it to write a new reply.
  displayAuthor: DisplayUser

  // The comment to display, including replies if there are any.
  comment: Comment

  timeago(dt: DateTime): string
  upvoteComment(id: string): void
  downvoteComment(id: string): void
  submitComment(id: string, content: string): void
  fetchMore(parentId: string, endCursor: string): void
}

type Comment = {
  createdAt: DateTime
  displayAuthor: DisplayUser
  content: string
  score: number
  userVote: undefined | 'UP' | 'DOWN'
  comments: undefined | CommentConnection
}

type CommentConnection = {
  totalCount: number
  pageInfo: {
    hasNextPage: boolean
    endCursor: undefined | string
  }
  nodes: Comment[]
}
```

### `<LoadMore />`

```react|noSource
<LoadMore t={t} count={128} onClick={() => {}} />
```

### `<Node />`

#### Example 1

```react|noSource
<Node comment={comments.comment1} />
```

#### Example 2

```react|noSource
<Node comment={comments.comment2} />
```

#### Example 3

```react|noSource
<Node comment={comments.comment3}  />
```

#### Example 4

```react|noSource
<Node comment={comments.comment4}  />
```

#### Example 5

```react|noSource
<Node comment={comments.comment5}  />
```

#### Example 6

```react|noSource
<Node comment={comments.comment6} />
```

#### Example 7

```react|noSource
<Node comment={comments.comment7} />
```

#### Example 8

```react|noSource
<Node comment={comments.comment8} />
```

#### Example 9

```react|noSource
<Node comment={comments.comment9} />
```
