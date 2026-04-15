import { NextResponse } from 'next/server'
import { getCMSClientBase } from '@app/lib/apollo/cms-client-base'
import {
  EmployeesDocument,
  EmployeesQuery,
} from '#graphql/cms/__generated__/gql/graphql'

const BASE_URL = process.env.PUBLIC_BASE_URL

export async function GET() {
  try {
    const client = await getCMSClientBase({ draftMode: false })

    const { data, error } = await client.query<EmployeesQuery>({
      query: EmployeesDocument,
    })

    if (error) {
      console.error('[profile-sitemap]', error)
      return NextResponse.json(
        { error: 'Failed to fetch employee data' },
        { status: 500 },
      )
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${data.employees
      .map(
        (employee: any) => `  <url>
        <loc>${BASE_URL}/~${employee.userId}</loc>
        <lastmod>${new Date(employee._updatedAt).toISOString()}</lastmod>
      </url>`,
      )
      .join('\n')}
    </urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('[profile-sitemap]', 'Failed to fetch employees:', error)
    return NextResponse.json(
      { error: 'Failed to generate profile sitemap' },
      { status: 500 },
    )
  }
}
