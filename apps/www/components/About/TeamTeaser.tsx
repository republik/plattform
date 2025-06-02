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
          setEmployees(
            // select twelve employees to show on about page
            data.employees
              .filter(
                (e) =>
                  e.subgroup === 'Rothaus-Redaktion' && e.group === 'Redaktion',
              )
              .slice(1)
              .sort(() => 0.5 - Math.random())
              .slice(0, 12),
          ),
        )
    }
  }, [employees])
  if (!employees) {
    return
  }

  return <EmployeeGrid omitHeadings={true} employees={employees} />
}

export default TeamTeaser
