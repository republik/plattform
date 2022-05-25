import { NextRequest } from 'next/server'

async function updateUserCookies(req: NextRequest): Promise<string> {
  const response = await fetch(process.env.API_URL, {
    method: 'POST',
    body: 'query { user { id } }',
    headers: {
      // Attach headers to the request
      cookie: req.headers.get('cookie'),
    },
  })
  console.log('new cookie values', response.headers.get('set-cookie'))
  // Return the updated cookie-header
  return response.headers.get('set-cookie')
}

export default updateUserCookies
