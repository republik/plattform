A `<TeaserNotification />` is a teaser used in a notification feed context.

Props:
- `href`
- `notification`
- `createdDate`
- `type` either `editorial`, `project-r` or `community`
- `source: { type, name, href, icon }`
- `disabled`

```react
<TeaserNotification
  title='Der Feind in meinem Feed'
  notification='<b>Neuer Beitrag</b> von Brigitte Hürlimann'
  createdDate='2020-02-13T13:17:08.643Z'
  type='Editorial'
  source={{ color: '#00B4FF', name: 'Am Gericht', href: 'https://www.republik.ch/format/am-gericht', icon: 'https://cdn.repub.ch/s3/republik-assets/github/republik/magazine/images/79c882cf521b13dc4ae13e5447cef30fac429b87.png.webp?size=1181x1181&resize=450x' }}
  href='https://www.republik.ch/2020/02/12/der-feind-in-meinem-feed'
/>
```


```react
<TeaserNotification
  title='Top Stories'
  notification='<b>Neuer Debattenbeitrag</b> von Patrick Recher'
  createdDate='2020-02-15T13:17:08.643Z'
  type='Community'
  source={{ color: '#3CAD00', name: 'Debatte', href: 'https://www.republik.ch/format/debatte' }}
  href='/top-storys'
/>
```
