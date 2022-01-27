export const exampleMdast = {
  type: 'root',
  children: [
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value:
            'Das Tückische beim Crowdfunding ist, dass der Ansturm entweder am Anfang kommt oder nie. Erreicht das Projekt in den ersten Tagen nicht mindestens einen Drittel des Ziels, ist es so gut wie gestorben. Nur ist das auch die Zeit, in der Ihr System am anfälligsten ist. Irgendeine Kinderkrankheit wird es haben, garantiert.',
          position: {
            start: {
              line: 1,
              column: 1,
              offset: 0
            },
            end: {
              line: 1,
              column: 321,
              offset: 320
            },
            indent: []
          }
        }
      ],
      position: {
        start: {
          line: 1,
          column: 1,
          offset: 0
        },
        end: {
          line: 1,
          column: 321,
          offset: 320
        },
        indent: []
      }
    }
  ]
}

export const exampleShortMdast = {
  type: 'root',
  children: [
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: 'Das Tückische beim Crowdfunding ist, dass der Ansturm…'
        }
      ]
    }
  ]
}

export const exampleLongMdast = {
  type: 'root',
  children: [
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value:
            'Das Tückische beim Crowdfunding ist, dass der Ansturm entweder am Anfang kommt oder nie. Erreicht das Projekt in den ersten Tagen nicht mindestens einen Drittel des Ziels, ist es so gut wie gestorben. Nur ist das auch die Zeit, in der Ihr System am anfälligsten ist. Irgendeine Kinderkrankheit wird es haben, garantiert.'
        }
      ]
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value:
            'Das Tückische beim Crowdfunding ist, dass der Ansturm entweder am Anfang kommt oder nie. Erreicht das Projekt in den ersten Tagen nicht mindestens einen Drittel des Ziels, ist es so gut wie gestorben. Nur ist das auch die Zeit, in der Ihr System am anfälligsten ist. Irgendeine Kinderkrankheit wird es haben, garantiert.'
        }
      ]
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value:
            'Das Tückische beim Crowdfunding ist, dass der Ansturm entweder am Anfang kommt oder nie. Erreicht das Projekt in den ersten Tagen nicht mindestens einen Drittel des Ziels, ist es so gut wie gestorben. Nur ist das auch die Zeit, in der Ihr System am anfälligsten ist. Irgendeine Kinderkrankheit wird es haben, garantiert.'
        }
      ]
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value:
            'Das Tückische beim Crowdfunding ist, dass der Ansturm entweder am Anfang kommt oder nie. Erreicht das Projekt in den ersten Tagen nicht mindestens einen Drittel des Ziels, ist es so gut wie gestorben. Nur ist das auch die Zeit, in der Ihr System am anfälligsten ist. Irgendeine Kinderkrankheit wird es haben, garantiert.'
        }
      ]
    }
  ]
}
