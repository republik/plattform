export const webOnlyTemplate = {
  type: 'root',
  children: [
    {
      type: 'zone',
      identifier: 'CENTER',
      data: {},
      children: [
        {
          type: 'zone',
          identifier: 'WEBONLY',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: 'Nur sichtbar auf der Webseite.',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  meta: {},
}
