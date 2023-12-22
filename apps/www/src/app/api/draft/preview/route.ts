// route handler with secret and slug
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  // Parse query string parameters
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')

  // Check the secret and next parameters
  // This secret should only be known to this route handler and the CMS
  if (secret !== process.env.DRAFT_MODE_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  if (!slug) {
    return new Response('Invalid slug', { status: 400 })
  }

  // // Fetch the headless CMS to check if the provided `slug` exists
  // // getPostBySlug would implement the required fetching logic to the headless CMS
  // const post = await getPostBySlug(slug)

  // // If the slug doesn't exist prevent draft mode from being enabled
  // if (!post) {
  //   return new Response('Invalid slug', { status: 401 })
  // }

  // Enable Draft Mode by setting the cookie
  draftMode().enable()

  // Redirect to the path from the fetched post
  // We don't redirect to searchParams.slug as that might lead to open redirect vulnerabilities
  redirect(slug)
}
