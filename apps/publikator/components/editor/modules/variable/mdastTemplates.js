export const greetingMdast = {
  type: 'root',
  children: [
    {
      type: 'zone',
      identifier: 'CENTER',
      data: {},
      children: [
        {
          type: 'zone',
          identifier: 'IF',
          data: {
            present: 'lastName',
          },
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: 'Guten Tag ',
                },
                {
                  type: 'span',
                  data: {
                    variable: 'firstName',
                  },
                  children: [],
                },
                {
                  type: 'text',
                  value: ' ',
                },
                {
                  type: 'span',
                  data: {
                    variable: 'lastName',
                  },
                  children: [],
                },
              ],
            },
            {
              type: 'zone',
              identifier: 'ELSE',
              data: {},
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      value: 'Willkommen',
                    },
                  ],
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

export const hasAccessMdast = {
  type: 'root',
  children: [
    {
      type: 'zone',
      identifier: 'CENTER',
      data: {},
      children: [
        {
          type: 'zone',
          identifier: 'IF',
          data: {
            present: 'hasAccess',
          },
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value:
                    'Nur sichtbar mit Magazin-Zugriff – für Mitglieder, Abonnentinnen oder Probeleser.',
                },
              ],
            },
            {
              type: 'zone',
              identifier: 'ELSE',
              data: {},
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      value: 'Nur ohne Magazin-Zugriff sichtbar – als Gast.',
                    },
                  ],
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
