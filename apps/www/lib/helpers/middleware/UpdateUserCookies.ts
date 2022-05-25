import { NextRequest } from 'next/server'

async function fetchUserObject(
  req: NextRequest,
): Promise<{ me: null | { roles: string[] }; cookie: string }> {
  const response = await fetch(process.env.API_URL, {
    method: 'POST',
    body: 'query { user { id } }',
    headers: {
      // Attach headers to the request
      cookie: req.headers.get('cookie'),
    },
  })

  console.log('new cookie values', response.headers.get('set-cookie'))

  if (response.ok) {
    const { me } = await response.json()
    if (me instanceof Object && 'roles' in me) {
      return {
        me,
        cookie: response.headers.get('set-cookie'),
      }
    }
  }

  // Return the updated cookie-header
  return {
    me: null,
    cookie: response.headers.get('set-cookie'),
  }
}

export default fetchUserObject
