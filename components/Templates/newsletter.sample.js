export default {
  'type': 'root',
  'children': [{
    'type': 'zone',
    'identifier': 'COVER',
    'data': {},
    'children': [{
      'type': 'paragraph',
      'children': [{
        'type': 'image',
        'title': null,
        'url': 'http://localhost:3004/assets/orbiting/newsletter-mdast-example/images/340bfcbd609be8a9bda99d7578f82e2fe84c61f5.jpeg',
        'alt': null
      }]
    },
    {
      'type': 'heading',
      'depth': 1,
      'children': [{
        'type': 'text',
        'value': 'The Titel'
      }]
    },
    {
      'type': 'paragraph',
      'children': [{
        'type': 'text',
        'value': '«One needs a good lead.»'
      }]
    }
    ]
  },
  {
    'type': 'zone',
    'identifier': 'CENTER',
    'data': {},
    'children': [{
      'type': 'paragraph',
      'children': [{
        'type': 'text',
        'value': 'Ladies and Gentlemen,'
      }]
    },
    {
      'type': 'paragraph',
      'children': [{
        'type': 'text',
        'value': 'Der '
      },
      {
        'type': 'link',
        'title': 'Markdown Abstract Syntax Tree',
        'url': 'https://github.com/syntax-tree/mdast',
        'children': [{
          'type': 'text',
          'value': 'Mdast'
        }]
      },
      {
        'type': 'text',
        'value': ' baum '
      },
      {
        'type': 'emphasis',
        'children': [{
          'type': 'text',
          'value': 'ist'
        }]
      },
      {
        'type': 'text',
        'value': ' ein '
      },
      {
        'type': 'strong',
        'children': [{
          'type': 'text',
          'value': 'Beispiel'
        }]
      },
      {
        'type': 'text',
        'value': '.'
      }
      ]
    },
    {
      'type': 'heading',
      'depth': 2,
      'children': [{
        'type': 'text',
        'value': 'Grosser Zwischentitel'
      }]
    },
    {
      'type': 'heading',
      'depth': 3,
      'children': [{
        'type': 'text',
        'value': 'Kleiner Zwischentitel'
      }]
    },
    {
      'type': 'zone',
      'identifier': 'FIGURE',
      'data': {},
      'children': [{
        'type': 'paragraph',
        'children': [{
          'type': 'image',
          'title': null,
          'url': 'http://localhost:3004/assets/orbiting/newsletter-mdast-example/images/f9d94c6b85e3b29558c30d7d37ee3458b049dded.jpeg',
          'alt': null
        }]
      },
      {
        'type': 'paragraph',
        'children': [{
          'type': 'text',
          'value': 'Das Hotel Rothaus '
        },
        {
          'type': 'emphasis',
          'children': [{
            'type': 'text',
            'value': 'Foto '
          }]
        },
        {
          'type': 'link',
          'title': null,
          'url': 'https://www.facebook.com/laurentburst',
          'children': [{
            'type': 'emphasis',
            'children': [{
              'type': 'text',
              'value': 'Laurent Burst'
            }]
          }]
        }
        ]
      }
      ]
    },
    {
      'type': 'blockquote',
      'children': [{
        'type': 'paragraph',
        'children': [{
          'type': 'text',
          'value': 'Ein Blockquote'
        }]
      }]
    },
    {
      'type': 'list',
      'ordered': false,
      'start': null,
      'loose': false,
      'children': [{
        'type': 'listItem',
        'loose': false,
        'checked': null,
        'children': [{
          'type': 'paragraph',
          'children': [{
            'type': 'text',
            'value': 'A'
          }]
        }]
      },
      {
        'type': 'listItem',
        'loose': false,
        'checked': null,
        'children': [{
          'type': 'paragraph',
          'children': [{
            'type': 'text',
            'value': 'B'
          }]
        }]
      },
      {
        'type': 'listItem',
        'loose': false,
        'checked': null,
        'children': [{
          'type': 'paragraph',
          'children': [{
            'type': 'text',
            'value': 'C'
          }]
        }]
      }
      ]
    },
    {
      'type': 'list',
      'ordered': true,
      'start': 1,
      'loose': false,
      'children': [{
        'type': 'listItem',
        'loose': false,
        'checked': null,
        'children': [{
          'type': 'paragraph',
          'children': [{
            'type': 'text',
            'value': 'Sie'
          }]
        }]
      },
      {
        'type': 'listItem',
        'loose': false,
        'checked': null,
        'children': [{
          'type': 'paragraph',
          'children': [{
            'type': 'text',
            'value': 'Du'
          }]
        }]
      },
      {
        'type': 'listItem',
        'loose': false,
        'checked': null,
        'children': [{
          'type': 'paragraph',
          'children': [{
            'type': 'text',
            'value': 'Ich'
          }]
        }]
      }
      ]
    },
    {
      'type': 'paragraph',
      'children': [
        {
          'type': 'text',
          'value': 'Dies ist ein neuer Paragraph.'
        },
        {
          'type': 'break'
        },
        {
          'type': 'text',
          'value': 'Und dies eine neue Zeile.'
        }
      ]
    },
    {
      'type': 'blockquote',
      'children': [
        {
          'type': 'paragraph',
          'children': [
            {
              'type': 'emphasis',
              'children': [
                {
                  'type': 'text',
                  'value': 'A'
                }
              ]
            },
            {
              'type': 'text',
              'value': ': Hallo B'
            },
            {
              'type': 'break'
            },
            {
              'type': 'emphasis',
              'children': [
                {
                  'type': 'text',
                  'value': 'B'
                }
              ]
            },
            {
              'type': 'text',
              'value': ': Alo A, auf Zeile -1'
            },
            {
              'type': 'break'
            },
            {
              'type': 'emphasis',
              'children': [
                {
                  'type': 'text',
                  'value': 'A'
                }
              ]
            },
            {
              'type': 'text',
              'value': ': Zeilenumbrüche sind toll!'
            }
          ]
        }
      ]
    },
    {
      'type': 'list',
      'ordered': false,
      'start': null,
      'loose': false,
      'children': [
        {
          'type': 'listItem',
          'loose': false,
          'checked': null,
          'children': [
            {
              'type': 'paragraph',
              'children': [
                {
                  'type': 'text',
                  'value': 'Auch'
                },
                {
                  'type': 'break'
                },
                {
                  'type': 'text',
                  'value': 'in'
                },
                {
                  'type': 'break'
                },
                {
                  'type': 'text',
                  'value': 'Listen'
                }
              ]
            }
          ]
        },
        {
          'type': 'listItem',
          'loose': false,
          'checked': null,
          'children': [
            {
              'type': 'paragraph',
              'children': [
                {
                  'type': 'text',
                  'value': 'Aha'
                }
              ]
            }
          ]
        }
      ]
    }
    ]
  }
  ],
  'meta': {
    'auto': true,
    'title': 'The Titel',
    'description': '«One needs a good lead.»',
    'image': 'http://localhost:3004/assets/orbiting/newsletter-mdast-example/images/340bfcbd609be8a9bda99d7578f82e2fe84c61f5.jpeg'
  }
}
