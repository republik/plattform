import React from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { css } from 'glamor'
import {
  Loader,
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
  <Link href={`/~${employee.user.slug || employee.user.id}`} passHref>
    <a {...styles.link}>{children}</a>
  </Link>
)

const Team = ({ t, data: { loading, error, employees } }) => {
  const [colorScheme] = useColorContext()
  return (
    <SectionContainer>
      <SectionTitle
        title={t('marketing/page/team/title')}
        lead={t('marketing/page/team/lead')}
      />
      <Loader
        loading={loading}
        error={error}
        style={{ minHeight: 400 }}
        render={() => (
          <TeaserFrontTileRow autoColumns>
            {employees.map((employee) => {
              return (
                <TeaserFrontTile key={employee.name}>
                  <h3 {...styles.pitch}>{`«${employee.pitch}»`}</h3>
                  <div {...styles.employee}>
                    <EmployeeLink employee={employee}>
                      <img
                        {...styles.profilePicture}
                        src={employee.user.portrait}
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
        )}
      />
      <Editorial.P style={{ textAlign: 'center' }}>
        <Link href='/impressum' passHref>
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

const query = gql`
  query MarketingTeam {
    employees(withBoosted: true, shuffle: 3, withPitch: true) {
      title
      name
      group
      subgroup
      pitch
      user {
        id
        portrait
        slug
      }
    }
  }
`

export default compose(graphql(query))(Team)
