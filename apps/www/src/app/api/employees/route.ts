import {
  EmployeesDocument,
  EmployeesQuery,
} from '#graphql/cms/__generated__/gql/graphql'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { NextResponse } from 'next/server'

type Employees = {
  employees: EmployeesQuery['employees']
}

export const revalidate = 5

export async function GET(): Promise<NextResponse<Employees>> {
  const client = await getCMSClient()

  const { data } = await client.query({
    query: EmployeesDocument,
  })

  return NextResponse.json({ employees: data.employees })
}
