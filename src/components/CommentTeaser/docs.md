A teaser of a comment.

```react|noSource,span-3
<CommentTeaser
  displayAuthor={{
    profilePicture: '/static/profilePicture1.png',
    name: 'Christof Moser',
    credential: {description: 'Journalist'}
  }}
  preview={{
    string: "Die Zeitungskäufe von Christoph Blocher, die Selbstideologisierung der NZZ, die Frankenstein-Monster-Strategie der Tamedia: Ehrlich gesagt wäre es uns lieber",
    more: true
  }}
  timeago={isoString => 'gerade eben'}
  t={t}
/>
```

```react|noSource,span-3
<CommentTeaser
  context={{
    title: "«Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie»",
    description: "von Constantin Seibt, 13.09.2017"
  }}
  preview={{
    string: "Die Zeitungskäufe von Christoph Blocher, die Selbstideologisierung der NZZ, die Frankenstein-Monster-Strategie der Tamedia: Ehrlich gesagt wäre es uns lieber",
    more: true
  }}
  timeago={isoString => 'gerade eben'}
  t={t}
/>
```

```react|noSource,span-3
<CommentTeaser
  context={{
    title: "«Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie»",
    description: "von Constantin Seibt, 13.09.2017"
  }}
  displayAuthor={{
    profilePicture: '/static/profilePicture1.png',
    name: 'Christof Moser',
    credential: {description: 'Journalist'}
  }}
  preview={{
    string: "Die Zeitungskäufe von Christoph Blocher, die Selbstideologisierung der NZZ, die Frankenstein-Monster-Strategie der Tamedia: Ehrlich gesagt wäre es uns lieber",
    more: true
  }}
  timeago={isoString => 'gerade eben'}
  commentUrl='https://www.republik.ch/foo'
  t={t}
/>
```

```react|noSource,span-3
<CommentTeaser
  tags={["Kritik"]}
  displayAuthor={{
    profilePicture: '/static/profilePicture1.png',
    name: 'Christof Moser',
    credential: {description: 'Journalist'}
  }}
  preview={{
    string: "Die Zeitungskäufe von Christoph Blocher, die Selbstideologisierung der NZZ, die Frankenstein-Monster-Strategie der Tamedia: Ehrlich gesagt wäre es uns lieber",
    more: true
  }}
  timeago={isoString => 'gerade eben'}
  commentUrl='https://www.republik.ch/foo'
  t={t}
/>
```

```react|noSource,span-3
<CommentTeaser
  displayAuthor={{
    profilePicture: '/static/profilePicture1.png',
    name: 'Christof Moser',
    credential: {description: 'Journalist'}
  }}
  highlights={[
    {fragments: [
        "Die Zeitungskäufe von Christoph Blocher, die Selbstideologisierung der NZZ, die <em>Frankenstein</em>-Monster-Strategie der Tamedia"
      ]
    }
  ]}
  timeago={isoString => 'gerade eben'}
  commentUrl='https://www.republik.ch/foo'
  t={t}
/>
```
