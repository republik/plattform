import { cookies } from 'next/headers'

/**
 * Function to fetch the roles of the user and updated cookies
 */
export async function meHasRole(role: string): Promise<boolean> {
  const cookie = cookies()

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}?query={me{roles}}`,
    {
      method: 'GET',
      //body: JSON.stringify({ query: 'query ' }),
      headers: {
        'Content-Type': 'application/json',
        // Attach headers to the request to ensure `me` is returned
        Cookie: cookie.toString(),
      },
    },
  )

  if (response.ok) {
    const { data } = await response.json()

    return data?.me?.roles.includes(role)
  }

  return false
}
