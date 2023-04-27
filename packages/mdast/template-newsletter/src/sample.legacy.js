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
      'type': 'blockquote',
      'children': [{
        'type': 'paragraph',
        'children': [{
          'type': 'text',
          'value': '«One needs a good lead.»'
        }]
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
        'value': 'Ladies and Gentlemen'
      }]
    }]
  }
  ],
  'meta': {
    'auto': true,
    'title': 'The Titel',
    'description': '«One needs a good lead.»',
    'image': 'http://localhost:3004/assets/orbiting/newsletter-mdast-example/images/340bfcbd609be8a9bda99d7578f82e2fe84c61f5.jpeg'
  }
}
