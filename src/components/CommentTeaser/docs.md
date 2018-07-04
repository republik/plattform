Provides a preview of a comment, featuring either a title/subtitle or a displayAuthor.



```react|noSource,span-3
<CommentTeaser
  title='@Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie'
  subtitle='Ein kurzer Untertitel'
  content={exampleMdast}
  timeago='2h'
  commentUrl='https://www.republik.ch/foo'
  t={t}
/>
```
```react|noSource,span-3
<CommentTeaser
  title='@Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie'
  subtitle='Ein kurzer Untertitelee'
  displayAuthor={{
    profilePicture: '/static/profilePicture1.png',
    name: 'Christof Moser',
    credential: {description: 'Journalist'}
  }}
  content={exampleMdast}
  timeago='2h'
  commentUrl='https://www.republik.ch/foo'
  t={t}
/>
```

 The `lineClamp` property currently only supports webkit line-clamping.
```react|noSource,span-3
<CommentTeaser
  title='@Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie'
  subtitle='Ein kurzer Untertitel'
  content={exampleMdast}
  timeago='2h'
  commentUrl='https://www.republik.ch/foo'
  lineClamp={3}
  t={t}
/>
```
```react|noSource,span-3
<CommentTeaser
  title='@Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie'
  subtitle='Ein kurzer Untertitelee'
  displayAuthor={{
    profilePicture: '/static/profilePicture1.png',
    name: 'Christof Moser',
    credential: {description: 'Journalist'}
  }}
  content={exampleMdast}
  timeago='2h'
  commentUrl='https://www.republik.ch/foo'
  lineClamp={3}
  t={t}
/>
```


The `isBox` property triggers a border.
```react|noSource,span-3
<CommentTeaser
  title='@Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie'
  subtitle='Ein kurzer Untertitel'
  content={exampleMdast}
  timeago='2h'
  commentUrl='https://www.republik.ch/foo'
  lineClamp={3}
  isBox={true}
  t={t}
/>
```
```react|noSource,span-3
<CommentTeaser
  title='@Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie'
  subtitle='Ein kurzer Untertitelee'
  displayAuthor={{
    profilePicture: '/static/profilePicture1.png',
    name: 'Christof Moser',
    credential: {description: 'Journalist'}
  }}
  content={exampleMdast}
  timeago='2h'
  commentUrl='https://www.republik.ch/foo'
  lineClamp={3}
  isBox={true}
  t={t}
/>
```

Adjacent `<CommentTeaser />` elements render a divider.

```react|noSource,span-6
<div>
<CommentTeaser
  title='@Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie'
  subtitle='Ein kurzer Untertitel'
  content={exampleMdast}
  timeago='2h'
  commentUrl='https://www.republik.ch/foo'
  lineClamp={3}
  t={t}
/>
<CommentTeaser
  title='@Die neusten Neulinge an Bord der «Republik»'
  subtitle='Ein kurzer Untertitel'
  content={exampleMdast}
  timeago='4h'
  commentUrl='https://www.republik.ch/foo'
  lineClamp={3}
  t={t}
/>
<CommentTeaser
  title='@Die Start-Aufstellung der «Republik»-Redaktion steht'
  subtitle='Ein kurzer Untertitel'
  content={exampleMdast}
  timeago='13. Juli 2017, 12:03 Uhr'
  commentUrl='https://www.republik.ch/foo'
  lineClamp={3}
  t={t}
/>
</div>
```
