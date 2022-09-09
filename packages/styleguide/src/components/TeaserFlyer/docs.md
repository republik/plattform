# TeaserFlyer

Used to show latest «Journal» entry on magazine front.

- `contentTree` (slate tree, required): part of a journal slate tree to be rendered in teh teaser.
- `formatTitle` (string, required): title of the format ()
- `flyerPath` (string, required): path to the format

```react|responsive
<TeaserFlyer
  contentTree={[
        {
          type: 'headline',
          children: [
            {
              text: 'This is the greeting',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              text: ' This is the opening Paragraph',
            },
          ],
        }
      ]}
  formatTitle="Republik-Journal"
  flyerPath="https://republik.ch"
/>

```
