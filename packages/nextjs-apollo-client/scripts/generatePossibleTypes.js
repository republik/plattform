const fetch = require('cross-fetch')
const fs = require('fs')
const path = require('path')

// Based on https://www.apollographql.com/docs/react/data/fragments/#generating-possibletypes-automatically
fetch(`http://localhost:5010/graphql`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    variables: {},
    query: `
      {
        __schema {
          types {
            kind
            name
            possibleTypes {
              name
            }
          }
        }
      }
    `,
  }),
})
  .then((result) => result.json())
  .then((result) => {
    const possibleTypes = {}

    result.data.__schema.types.forEach((supertype) => {
      if (supertype.possibleTypes) {
        possibleTypes[supertype.name] = supertype.possibleTypes.map(
          (subtype) => subtype.name,
        )
      }
    })

    fs.writeFile(
      path.join(__dirname, '../src/generated/possibleTypes.json'),
      JSON.stringify(possibleTypes),
      (err) => {
        if (err) {
          console.error('Error writing possibleTypes.json', err)
        } else {
          console.log('Fragment types successfully extracted!')
        }
      },
    )
  })
  .catch((err) =>
    console.error(
      'Error extracting fragment types.\n' +
        'Ensure the API is available on "http://localhost:5010"\n' +
        'by running the api locally or using yaproxy',
      err,
    ),
  )
