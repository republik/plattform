// route handler with secret and redirect path
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const path = searchParams.get('path')

  if (!process.env.DRAFT_MODE_SECRET) {
    return new Response('Draft Mode not configured', { status: 500 })
  }

  // Check the secret and next parameters
  // This secret should only be known to this route handler and the CMS
  if (secret !== process.env.DRAFT_MODE_SECRET) {
    return new Response('Invalid query', { status: 401 })
  }

  // Check that redirect path is relative, as it otherwise might lead to open redirect vulnerabilities
  if (!path || !path.startsWith('/')) {
    return new Response('Invalid query', { status: 401 })
  }

  // Enable Draft Mode by setting the cookie
  const dm = await draftMode()
  dm.enable()

  // Redirect to the path
  redirect(path)
}
