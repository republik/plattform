const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')

require('dotenv').config()

fetch(process.env.API_URL, {
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
    // here we're filtering out any type information unrelated to unions or interfaces
    const filteredData = result.data.__schema.types.filter(
      (type) => type.possibleTypes !== null,
    )
    result.data.__schema.types = filteredData
    fs.writeFile(
      path.join(__dirname, 'fragmentTypes.json'),
      JSON.stringify(result.data, null, 2),
      (err) => {
        if (err) {
          console.error('Error writing fragmentTypes file', err)
        } else {
          console.log('Fragment types successfully extracted!')
        }
      },
    )
  })
