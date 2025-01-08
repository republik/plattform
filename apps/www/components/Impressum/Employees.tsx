import { css } from 'glamor'
import { entries, nest } from 'd3-collection'

import { mediaQueries, fontStyles } from '@project-r/styleguide'
import { EmployeeRecord } from '#graphql/cms/__generated__/gql/graphql'
import Link from 'next/link'

const styles = {
  container: css({
    marginBottom: 30,
    [mediaQueries.mUp]: {
      marginBottom: 50,
    },
  }),
  groupHeading: css({
    marginBottom: 16,
    ...fontStyles.sansSerifMedium22,
    [mediaQueries.mUp]: {
      marginBottom: 24,
      ...fontStyles.sansSerifMedium24,
    },
  }),
  subgroupHeading: css({
    marginBottom: 8,
    ...fontStyles.sansSerifMedium18,
    [mediaQueries.mUp]: {
      marginBottom: 16,
      ...fontStyles.sansSerifMedium20,
    },
  }),
  tiles: css({
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: 'repeat(2, 1fr)',
    marginBottom: 24,
    [mediaQueries.mUp]: {
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '2rem',
      marginBottom: 36,
    },
  }),
  profile: css({
    display: 'inline-block',
    width: '100%',
    margin: 0,
  }),
  name: css({
    ...fontStyles.sansSerifMedium16,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifMedium19,
    },
  }),
  title: css({
    ...fontStyles.sansSerifRegular14,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular17,
    },
  }),
}

type EmployeesProps = {
  employees: EmployeeRecord[]
}

const Employees = ({ employees }: EmployeesProps) => {
  const employeeGroups = nest()
    .key((d) => d['group'])
    .key((d) => d['subgroup'] || 'group')
    .object(employees)
  return (
    <div {...styles.container}>
      {entries(employeeGroups).map((group) => (
        <section key={group.key}>
          <h2 {...styles.groupHeading}>{group.key}</h2>
          {group.value.group ? (
            <div {...styles.tiles}>
              {group.value.group.map((employee) => {
                return (
                  <Link href={`/~${employee.userId}`} key={employee.userId}>
                    <img
                      {...styles.profile}
                      src={employee.profile.url}
                      alt={employee.name}
                    />
                    <span {...styles.name}>{employee.name}</span>
                  </Link>
                )
              })}
            </div>
          ) : (
            entries(group.value).map((subgroup) => (
              <section key={subgroup.key}>
                <h3 {...styles.subgroupHeading}>{subgroup.key}</h3>
                <div {...styles.tiles}>
                  {subgroup.value.map((employee) => (
                    <Employee employee={employee} key={employee.userId} />
                  ))}
                </div>
              </section>
            ))
          )}
        </section>
      ))}
    </div>
  )
}

const Employee = ({ employee }) => {
  return (
    <Link href={`/~${employee.userId}`}>
      <img {...styles.profile} src={employee.profile.url} />
      <span {...styles.name}>{employee.name}</span>
      <br />
      <span {...styles.title}>{employee.title}</span>
    </Link>
  )
}

export default Employees
