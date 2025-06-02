import { css } from 'glamor'
import {
  TeaserFrontTileRow,
  TeaserFrontTile,
  Label,
  fontStyles,
  Editorial,
  useColorContext,
} from '@project-r/styleguide'

import SectionTitle from './Common/SectionTitle'
import SectionContainer from './Common/SectionContainer'
import Link from 'next/link'

const EmployeeLink = ({ employee, children }) => (
  <Link href={`/~${employee.userId}`} {...styles.link}>
    {children}
  </Link>
)

const Team = ({ employees, title, description }) => {
  const [colorScheme] = useColorContext()
  const threeMarketingEmployees = employees.slice(1).sort(() => 0.5 - Math.random()).slice(0, 3)
  return (
    <SectionContainer>
      <SectionTitle title={title} lead={description} />
      <TeaserFrontTileRow autoColumns>
        {threeMarketingEmployees.map((employee) => {
          return (
            <TeaserFrontTile key={employee.name}>
              <h3 {...styles.pitch}>{`«${employee.pitch}»`}</h3>
              <div {...styles.employee}>
                <EmployeeLink employee={employee}>
                  <img
                    {...styles.profilePicture}
                    src={employee.profile.url}
                    alt=''
                  />
                </EmployeeLink>
                <div {...styles.employeeText}>
                  <p {...styles.employeeName}>
                    <EmployeeLink employee={employee}>
                      {employee.name}
                    </EmployeeLink>
                  </p>
                  <Label {...colorScheme.set('color', 'disabled')}>
                    {employee.title || employee.group}
                  </Label>
                </div>
              </div>
            </TeaserFrontTile>
          )
        })}
      </TeaserFrontTileRow>
      <Editorial.P style={{ textAlign: 'center' }}>
        <Link href='/impressum' passHref legacyBehavior>
          <Editorial.A>Alle Teammitglieder</Editorial.A>
        </Link>
      </Editorial.P>
    </SectionContainer>
  )
}

const styles = {
  link: css({
    color: 'inherit',
    textDecoration: 'none',
  }),
  profilePicture: css({
    display: 'block',
    width: 46,
    flex: `0 0 ${46}`,
    height: 46,
    marginRight: 8,
  }),
  pitch: css({
    ...fontStyles.serifTitle26,
    wordWrap: 'break-word',
    marginBlock: '1em',
  }),
  employee: css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  employeeText: css({
    textAlign: 'left',
  }),
  employeeName: css({
    ...fontStyles.sansSerifRegular18,
    whiteSpace: 'nowrap',
    lineHeight: 1.2,
    margin: 0,
  }),
}

export default Team
