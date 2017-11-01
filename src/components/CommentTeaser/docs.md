Provides a preview of a comment, featuring either a title/subtitle or a displayAuthor.

```react|noSource,span-3
<CommentTeaser
  title='@Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie'
  subtitle='Ein kurzer Untertitel'
  content="Das Tückische beim Crowdfunding ist, dass der Ansturm entweder am Anfang kommt oder nie. Erreicht das Projekt in den ersten Tagen nicht mindestens einen Drittel des Ziels, ist es so gut wie gestorben. Nur ist das auch die Zeit, in der Ihr System am anfälligsten ist. Irgendeine Kinderkrankheit wird es haben, garantiert."
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
  content="Das Tückische beim Crowdfunding ist, dass der Ansturm entweder am Anfang kommt oder nie. Erreicht das Projekt in den ersten Tagen nicht mindestens einen Drittel des Ziels, ist es so gut wie gestorben. Nur ist das auch die Zeit, in der Ihr System am anfälligsten ist. Irgendeine Kinderkrankheit wird es haben, garantiert."
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
  content="Das Tückische beim Crowdfunding ist, dass der Ansturm entweder am Anfang kommt oder nie. Erreicht das Projekt in den ersten Tagen nicht mindestens einen Drittel des Ziels, ist es so gut wie gestorben. Nur ist das auch die Zeit, in der Ihr System am anfälligsten ist. Irgendeine Kinderkrankheit wird es haben, garantiert."
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
  content="Das Tückische beim Crowdfunding ist, dass der Ansturm entweder am Anfang kommt oder nie. Erreicht das Projekt in den ersten Tagen nicht mindestens einen Drittel des Ziels, ist es so gut wie gestorben. Nur ist das auch die Zeit, in der Ihr System am anfälligsten ist. Irgendeine Kinderkrankheit wird es haben, garantiert."
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
  content="Das Tückische beim Crowdfunding ist, dass der Ansturm entweder am Anfang kommt oder nie. Erreicht das Projekt in den ersten Tagen nicht mindestens einen Drittel des Ziels, ist es so gut wie gestorben. Nur ist das auch die Zeit, in der Ihr System am anfälligsten ist. Irgendeine Kinderkrankheit wird es haben, garantiert."
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
  content="Das Tückische beim Crowdfunding ist, dass der Ansturm entweder am Anfang kommt oder nie. Erreicht das Projekt in den ersten Tagen nicht mindestens einen Drittel des Ziels, ist es so gut wie gestorben. Nur ist das auch die Zeit, in der Ihr System am anfälligsten ist. Irgendeine Kinderkrankheit wird es haben, garantiert."
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
  content="Das Tückische beim Crowdfunding ist, dass der Ansturm entweder am Anfang kommt oder nie. Erreicht das Projekt in den ersten Tagen nicht mindestens einen Drittel des Ziels, ist es so gut wie gestorben. Nur ist das auch die Zeit, in der Ihr System am anfälligsten ist. Irgendeine Kinderkrankheit wird es haben, garantiert."
  timeago='2h'
  commentUrl='https://www.republik.ch/foo'
  lineClamp={3}
  t={t}
/>
<CommentTeaser
  title='@Die neusten Neulinge an Bord der «Republik»'
  subtitle='Ein kurzer Untertitel'
  content="Sie als Verlegerin oder Verleger der «Republik» wird beruhigen, dass das nicht unsere Absicht ist. (So reizvoll es wäre.) Wir haben einige Fortschritte gemacht: Die Finanzplanung steht, der Prototyp des Publikationssystems läuft – und zwar elegant! – und der Grossteil der Redaktion ist angeheuert. Also sind alle Fundamente für den Start im Januar gelegt."
  timeago='4h'
  commentUrl='https://www.republik.ch/foo'
  lineClamp={3}
  t={t}
/>
<CommentTeaser
  title='@Die Start-Aufstellung der «Republik»-Redaktion steht'
  subtitle='Ein kurzer Untertitel'
  content="Wir haben Ihnen als Verlegerin, als Verleger beim Crowdfunding versprochen, dass die Redaktion möglichst gemischt sein soll: nach Erfahrungen, Alter, Fähigkeiten – und etwa 50:50 in Sachen Geschlecht. Denn zusammen mit zu viel ähnlichen Leuten hat man keine Chance, den eigenen blinden Flecken zu entkommen. Egal, wie man sich dreht: Je schärfer man hinsieht, desto unsichtbarer wird, was man nicht sieht."
  timeago='13. Juli 2017, 12:03 Uhr'
  commentUrl='https://www.republik.ch/foo'
  lineClamp={3}
  t={t}
/>
</div>
```
