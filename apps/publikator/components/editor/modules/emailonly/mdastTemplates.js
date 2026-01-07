export const emailOnlyTemplate = {
  type: 'root',
  children: [
    {
      type: 'zone',
      identifier: 'CENTER',
      data: {},
      children: [
        {
          type: 'zone',
          identifier: 'EMAILONLY',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: 'Nur sichtbar im Newsletter.',
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
