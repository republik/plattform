A discussion is logically a tree structure, but is displayed more like a list. This is so that we can display a sequence of direct replies without increasing indentation.

Each comment is shown as a full-width div, indented such that the profile picture is shown at a particular depth (`visualDepth`, starting at 1). The empty space on the left left is filled with vertical bars. The `otherChild` flag controls whether a vertical bar is placed through the profile picture or not.

Keep in mind that each vertical bar is 40 + 10 px wide, so there's a limit how deep you can go while still leaving enough space for the comment content.

```react|noSource,span-3,plain
<Row t={t} comment={comments.comment1} visualDepth={1} otherChild />
```
```react|noSource,span-3,plain
<Row t={t} comment={comments.comment1} visualDepth={3} />
```

The right-most vertical bar can be placed directly through the center of the profile pictur, to indicate that the comment is part of a sequence. The comment can be either the first one in a sequence (`head`), in the middle (`??`) or last (`tail`).

```react|noSource,span-2,plain
<Row t={t} comment={comments.comment1} visualDepth={3} head />
```
```react|noSource,span-2,plain
<Row t={t} comment={comments.comment1} visualDepth={3} />
```
```react|noSource,span-2,plain
<Row t={t} comment={comments.comment1} visualDepth={3} tail />
```

### `<CommentTreeLoadMore />`

To indicate that there are more comments which can be loaded at a particular depth, use `<CommentTreeLoadMore />`. The component uses the same `visualDepth` concept as  `<Row />`. The left edge of the horizontal bar is aligned with the left edge of the profile picture. But it can also be indented a bit so that it connects with the last vertical bar of the preceding `<Row />` (make sure to set `otherChild=false` on the preceding `<Row />` so that the last vertical bar is drawn).

```react|noSource,span-3,plain
<div>
  <Row t={t} comment={comments.comment1} visualDepth={1} head otherChild />
  <LoadMore t={t} visualDepth={1} count={128} onClick={() => {}} />
</div>
```
```react|noSource,span-3,plain
<div>
  <Row t={t} comment={comments.comment1} visualDepth={1} head />
  <LoadMore t={t} visualDepth={1} connected count={128} onClick={() => {}} />
</div>
```
```react|noSource,span-3,plain
<div>
  <Row t={t} comment={comments.comment1} visualDepth={3} otherChild />
  <LoadMore t={t} visualDepth={3} count={128} onClick={() => {}} />
</div>
```
```react|noSource,span-3,plain
<div>
  <Row t={t} comment={comments.comment1} visualDepth={3} />
  <LoadMore t={t} visualDepth={3} connected count={128} onClick={() => {}} />
</div>
```

```react|noSource,plain
<div>
  <Row t={t} comment={comments.comment1} visualDepth={2} head />
  <LoadMore t={t} visualDepth={3} count={72} onClick={() => {}} />
  <LoadMore t={t} visualDepth={2} connected count={128} onClick={() => {}} />
</div>
```

### `<CommentTreeCollapse />`

If the comments after a certain point can be collapsed, use `<CommentTreeCollapse />`. This element is always shown full-width, there is no way to indent it.


```react|noSource,plain
<div>
  <Row t={t} comment={comments.comment1} visualDepth={3} head />
  <Collapse t={t} onClick={() => {}} />
</div>
```


### `<CommentTreeNode />`

The `<CommentTreeNode />` shows a comment and its children. It is up to the user of this component to define what should be shown in places where more comments can be loaded (using the `More` prop). Every node has a `visualDepth` (number of bars) and also a `logicalDepth` (how many parents one must walk to get to the root).

#### Example 1

```react|noSource,plain
<Node t={t} comment={comments.comment1} />
```

#### Example 2

```react|noSource,plain
<Node t={t} comment={comments.comment2} />
```

#### Example 3

```react|noSource,plain
<Node t={t} comment={comments.comment3}  />
```

#### Example 4

```react|noSource,plain
<Node t={t} comment={comments.comment4}  />
```

#### Example 5

```react|noSource,plain
<Node t={t} comment={comments.comment5}  />
```

#### Example 6

```react|noSource,plain
<Node t={t} comment={comments.comment6} />
```

#### Example 7

```react|noSource,plain
<Node t={t} comment={comments.comment7} />
```

#### Example 8

```react|noSource,plain
<Node t={t} comment={comments.comment8} />
```

#### Example 9

```react|noSource,plain
<Node t={t} comment={comments.comment9} />
```
