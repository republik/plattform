import EmployeeGrid from '../Impressum/Employees'
import { EmployeeRecord } from '#graphql/cms/__generated__/gql/graphql'

import { useEffect, useState } from 'react'

const TeamTeaser = () => {
  const [employees, setEmployees] = useState<EmployeeRecord[] | undefined>()
  useEffect(() => {
    if (!employees) {
      fetch('/api/employees')
        .then((res) => res.json())
        .then((data: { employees: EmployeeRecord[] }) =>
          setEmployees(data.employees),
        )
    }
  }, [employees])
  if (!employees) {
    return
  }
  // select twelve employees to show on about page
  const selectedEmployees = employees
    .filter(
      (e) => e.subgroup === 'Rothaus-Redaktion' && e.group === 'Redaktion',
    )
    .slice(1)
    .sort(() => 0.5 - Math.random())
    .slice(0, 12)
  return <EmployeeGrid employees={selectedEmployees} />
}

export default TeamTeaser
