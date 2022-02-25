import React from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { css, merge } from 'glamor'
import { entries, nest } from 'd3-collection'

import Employee from './Employee'
import { Loader, Interaction, mediaQueries } from '@project-r/styleguide'

const { H2, H3 } = Interaction

const styles = {
  container: css({
    marginBottom: 30,
    [mediaQueries.mUp]: {
      marginBottom: 50,
    },
  }),
  group: css({
    marginTop: 30,
    [mediaQueries.mUp]: {
      marginTop: 50,
    },
  }),
  subgroup: css({
    marginTop: 10,
    [mediaQueries.mUp]: {
      marginTop: 20,
    },
  }),
  groupHeading: css({
    marginBottom: 10,
    [mediaQueries.mUp]: {
      marginBottom: 20,
    },
  }),
  subgroupHeading: css({
    margin: '5px 0',
    [mediaQueries.mUp]: {
      margin: '10px 0',
    },
  }),
  tiles: css({
    marginLeft: '-5px',
    flexWrap: 'wrap',
    display: 'flex',
    flexDirection: 'row',
  }),
  tilesSingleRow: css({
    flexWrap: 'nowrap',
    overflow: 'hidden',
  }),
}

const getEmployees = gql`
  query getEmployees($shuffle: Int, $withBoosted: Boolean) {
    employees(withBoosted: $withBoosted, shuffle: $shuffle) {
      title
      name
      group
      subgroup
      user {
        id
        portrait
        slug
      }
    }
  }
`

const renderEmployee =
  ({ minColumns, maxColumns, singleRow }) =>
  (employee, i) =>
    (
      <Employee
        {...employee}
        key={i}
        minColumns={minColumns}
        maxColumns={maxColumns}
        singleRow={singleRow}
      />
    )

const Employees = compose(
  graphql(getEmployees, {
    options: ({ ssr = true }) => ({
      ssr,
    }),
  }),
)(
  ({
    data: { loading, error, employees },
    filter,
    slice,
    minColumns,
    maxColumns,
    singleRow,
  }) => (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const tilesStyle = merge(
          styles.tiles,
          singleRow && styles.tilesSingleRow,
        )
        if (filter) {
          return (
            <div>
              <div {...tilesStyle}>
                {employees
                  .filter(filter)
                  .slice(0, slice)
                  .map(renderEmployee({ minColumns, maxColumns, singleRow }))}
              </div>
            </div>
          )
        }
        const employeeGroups = nest()
          .key((d) => d['group'])
          .key((d) => d['subgroup'] || 'group')
          .object(employees)
        return (
          <div {...styles.container}>
            {entries(employeeGroups).map((group) => (
              <section {...styles.group} key={group.key}>
                <H2 {...styles.groupHeading}>{group.key}</H2>
                {group.value.group ? (
                  <div {...tilesStyle}>
                    {group.value.group.map(
                      renderEmployee({ minColumns, maxColumns, singleRow }),
                    )}
                  </div>
                ) : (
                  entries(group.value).map((subgroup) => (
                    <section {...styles.subgroup} key={subgroup.key}>
                      <H3 {...styles.subgroupHeading}>{subgroup.key}</H3>
                      <div {...tilesStyle}>
                        {subgroup.value.map(
                          renderEmployee({ minColumns, maxColumns, singleRow }),
                        )}
                      </div>
                    </section>
                  ))
                )}
              </section>
            ))}
          </div>
        )
      }}
    />
  ),
)

export default Employees
