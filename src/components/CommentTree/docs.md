These are the relevant types which are used by the `<Node />` component:

```code|lang-js
type NodeProps = {
  // Component which renders a reply. This is needed so that
  // user of this component can connect each reply with graphql
  // or other react contexts to provide the required props.
  Node: React.Component

  // The translation function.
  t(…): string

  // The current user, this is passed to the comment composer
  // when the user opens it to write a new reply.
  displayAuthor: DisplayUser

  // The comment to display, including replies if there are any.
  comment: Comment

  upvoteComment(): void
  downvoteComment(): void
  submitComment(content: string): void
}

type Comment = {
  timeago: string
  displayAuthor: DisplayUser
  content: string
  score: number
  replies: undefined | Replies
}

type Replies = {
  // The replies are passed as IDs. Its job of the child Node
  // component to fetch the full data.
  comments: {id: ID}[]

  // If there are more replies, this sais how many more, and the
  // `load` function can be invoked to fetch them.
  more: undefined | {count: number, load(): void}
}
```

### `<LoadMore />`

```react|noSource
<LoadMore t={t} count={128} onClick={() => {}} />
```

### `<Node />`

#### Example 1

```react|noSource
<Node top commentId='1' />
```

#### Example 2

```react|noSource
<Node top commentId='2' />
```

#### Example 3

```react|noSource
<Node top commentId='3'  />
```

#### Example 4

```react|noSource
<Node top commentId='4'  />
```

#### Example 5

```react|noSource
<Node top commentId='5'  />
```

#### Example 6

```react|noSource
<Node top commentId='6' />
```

#### Example 7

```react|noSource
<Node top commentId='7' />
```

#### Example 8

```react|noSource
<Node top commentId='8' />
```

#### Example 9

```react|noSource
<Node top commentId='9' />
```
