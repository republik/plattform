Used to show latest «Journal» entry on magazine front.

- `flyer`: a Document node

```react
<TeaserFlyer
  flyer={
    {
      meta: {
        title: 'A title',
        path: '/2022/09/09/journal',
        externalBaseUrl: null,
        format: {
          meta: {
            title: 'Republik-Journal',
          },
        },
      },
      content: {
        children: [
          {
            children: [
              {
                children: [
                  {
                    text: 'Guten Morgen,',
                  },
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    type: 'break',
                  },
                  {
                    text: 'schön sind Sie da!',
                  },
                ],
                type: 'headline',
              },
              {
                type: 'flyerOpeningP',
                children: [
                  {
                    text: 'Es war heiss, es ist heiss, es bleibt heiss. In Europa sind die Temperaturen grade hochsommerlich. Im Nahen Osten sind sie lebensfeindlich. ',
                  },
                  {
                    type: 'link',
                    children: [{ text: 'Im Irak wurden gestern 51.6°C gemessen.' }],
                  },
                  {
                    text: ' Hoch genug, um in einem Backofen ein Entrecôte niederzugaren.',
                  },
                ],
              },
            ],
            type: 'flyerTileOpening',
          },
          {
            children: [
              {
                children: [
                  {
                    text: 'Bis nachher!',
                  },
                ],
                type: 'headline',
              },
              {
                children: [
                  {
                    text: 'Ihre Crew der Republik',
                  },
                ],
                type: 'flyerSignature',
              },
            ],
            type: 'flyerTileClosing',
          },
        ],
      },
    }
  }
/>
```
