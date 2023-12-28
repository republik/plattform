import { redirect } from 'next/navigation'

export default function Page() {
  if (!process.env.FRONTEND_BASE_URL) {
    throw new Error('nope')
  }

  // Parse a fully qualified URL from FRONTEND_BASE_URL
  const url = new URL(process.env.FRONTEND_BASE_URL)

  // Haha, there is not page! Just a redirect.
  redirect(url.toString())
}
