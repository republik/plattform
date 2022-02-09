import formatCredits from './formatCredits'

const fixture = [
  {
    title: 'simple',
    credits: [
      {
        type: 'text',
        value: '12.06.2018',
      },
    ],
    expected: [
      {
        type: 'text',
        value: '', // date removed
      },
    ],
  },
  {
    title: 'standard',
    credits: [
      {
        type: 'text',
        value: 'Von Marco Salvi, 12.06.2018 ',
      },
    ],
    expected: [
      {
        type: 'text',
        value: 'Von Marco Salvi', // date removed
      },
    ],
  },
  {
    title: 'nopadding',
    credits: [
      {
        type: 'text',
        value: 'Von Marco Salvi, 1.6.2018 ',
      },
    ],
    expected: [
      {
        type: 'text',
        value: 'Von Marco Salvi', // date removed
      },
    ],
  },
  {
    title: 'update',
    credits: [
      {
        type: 'text',
        value: 'Von ',
      },
      {
        children: [
          {
            type: 'text',
            value: 'Sylke Gruhnwald',
          },
        ],
        type: 'link',
        title: null,
        url: '/~sylke',
      },
      {
        type: 'text',
        value: ', 06.04.2019, Update: 03.09.2019',
      },
    ],
    expected: [
      {
        type: 'text',
        value: 'Von ',
      },
      {
        children: [
          {
            type: 'text',
            value: 'Sylke Gruhnwald',
          },
        ],
        type: 'link',
        title: null,
        url: '/~sylke',
      },
      {
        type: 'text',
        value: ', Update: 03.09.2019',
      },
    ],
  },
  {
    title: 'mixed',
    credits: [
      {
        type: 'text',
        value: 'Von ',
      },
      {
        children: [
          {
            type: 'text',
            value: 'Constantin Seibt',
          },
        ],
        title: null,
        type: 'link',
        url: '/~cseibt',
      },
      {
        type: 'text',
        value: ', ',
      },
      {
        children: [
          {
            type: 'text',
            value: 'Anja Conzett',
          },
        ],
        title: 'Anja Conzett',
        type: 'link',
        url: '/~acon',
      },
      {
        type: 'text',
        value: ', Gion-Mattias Durband, 12.06.2018',
      },
    ],
    expected: [
      {
        type: 'text',
        value: 'Von ',
      },
      {
        children: [
          {
            type: 'text',
            value: 'Constantin Seibt',
          },
        ],
        title: null,
        type: 'link',
        url: '/~cseibt',
      },
      {
        type: 'text',
        value: ', ',
      },
      {
        children: [
          {
            type: 'text',
            value: 'Anja Conzett',
          },
        ],
        title: 'Anja Conzett',
        type: 'link',
        url: '/~acon',
      },
      {
        type: 'text',
        value: ', Gion-Mattias Durband', // date removed
      },
    ],
  },
  {
    title: 'Update',
    credits: [
      {
        type: 'text',
        value: '27.08.2019, Update: 05.09.2019',
      },
    ],
    expected: [
      {
        type: 'text',
        value: 'Update: 05.09.2019', // without author credit
      },
    ],
  },
]

describe('/components/Feed/formatCredits.js', () => {
  fixture.forEach(({ title, credits, expected }) => {
    test(`should format credits (${title})`, () => {
      expect(formatCredits(credits)).toEqual(expected)
    })
  })
})
