A discussion is logically a tree structure, but is displayed more like a list. This is so that we can display a sequence of direct replies without increasing indentation.

Each comment is shown as a full-width div, with an appropriate number of vertical bars on its left to indicate its depth (`visualDepth`). Additional amount of left padding an be added with the `otherChild` flag. Below are three examples with varying visual depths, the last one has the `otherChild` flag set to true.

```react|noSource,span-3,plain
<Row t={t} comment={comments.comment1} visualDepth={2} />
```
```react|noSource,span-3,plain
<Row t={t} comment={comments.comment1} visualDepth={4} otherChild />
```

The right-most vertical bar can be made shorter at the top or bottom to indicate it's the first (`head`) or last (`tail`) comment of a sequence.

```react|noSource,span-2,plain
<Row t={t} comment={comments.comment1} visualDepth={3} head />
```
```react|noSource,span-2,plain
<Row t={t} comment={comments.comment1} visualDepth={3} head tail />
```
```react|noSource,span-2,plain
<Row t={t} comment={comments.comment1} visualDepth={3} tail />
```

### `<CommentTreeLoadMore />`, `<CommentTreeCollapse />`

To indicate that there are more comments which can be loaded at a particular depth, use `<CommentTreeLoadMore />`. Inversely, if the comments after a certain point can be collapsed, use `<CommentTreeCollapse />`. This element is always shown full-width, there is no way to indent it. Don't forget to set `tail=false` on the `<Row />` immediately preceding these elements.

```react|noSource,span-3,plain
<div>
  <Row t={t} comment={comments.comment1} visualDepth={3} head />
  <LoadMore t={t} visualDepth={3} count={128} onClick={() => {}} />
</div>
```
```react|noSource,span-3,plain
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
