import { gql, useQuery } from '@apollo/client'
import { Editorial, Interaction, Label, Loader } from '@project-r/styleguide'
import { css } from 'glamor'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { countFormat } from '../../lib/utils/formats'
import { displayDate, displayDateTime } from '../Display/utils'

import Input from '../Form/Input'
import Table, { TableRaw, tableStyles } from './Table'

const gqlQuery = gql`
  query liveReport($begin: String, $end: String) {
    report(params: { begin: $begin, end: $end }) {
      id
      createdAt
      data
    }
  }
`

const hideOnPrint = css({
  '@media print': {
    display: 'none',
  },
})

const Live = () => {
  const { pathname, query, replace } = useRouter()
  const { loading, data, error } = useQuery(gqlQuery, {
    variables: {
      begin: query.from || '2022-10-24',
      end: query.to || '2023-01-01',
    },
  })

  return (
    <>
      <div {...hideOnPrint}>
        <Input
          label='Von Tag (mit)'
          type='date'
          onChange={(e) => {
            replace({
              pathname,
              query: {
                from: e.target.value,
                to: query.to,
              },
            })
          }}
          value={query.from}
        />
        <Input
          label='bis zum Tag (ohne)'
          type='date'
          onChange={(e) => {
            replace({
              pathname,
              query: {
                from: query.from,
                to: e.target.value,
              },
            })
          }}
          value={query.to}
        />
        <Label>
          Beispiele: Jahresbericht 01.01.2022 bis 01.01.2023, Monatsbericht
          01.01.2023 bis 01.02.2023
        </Label>
      </div>
      <Loader
        loading={loading}
        error={error}
        render={() => {
          const {
            createdAt,
            data: {
              timeFilter,
              maxPaymentDate,
              maxPostfinanceDate,
              unmatchedPostFinancePayments,
              packages,
              methods,
              membershipDays,
              transactionItems,
            },
          } = data.report
          return (
            <div style={{ margin: '20px 0' }}>
              <Interaction.H2 style={{ marginBottom: 20 }}>
                Bericht {displayDate(timeFilter.begin)} bis{' '}
                {displayDate(timeFilter.end)}
              </Interaction.H2>
              <Interaction.H3>Datenstand</Interaction.H3>
              <Interaction.P>
                Bericht erstellt am: {displayDateTime(createdAt)}
                <br />
                Letzte Zahlungsaktualisierung: {displayDateTime(maxPaymentDate)}
                <br />
                Letztes Buchungsdatum Bankkonto-Eingang:{' '}
                {displayDate(maxPostfinanceDate)}
                <br />
                {unmatchedPostFinancePayments ? (
                  <>
                    Nicht zugewiesene Bankkonto-Eingänge:{' '}
                    {countFormat(unmatchedPostFinancePayments)}
                  </>
                ) : null}
              </Interaction.P>
              <Interaction.H3 style={{ marginTop: 20, marginBottom: 10 }}>
                Zahlungen nach Angebote
              </Interaction.H3>
              <Table groups={packages} />
              <Interaction.H3 style={{ marginTop: 20, marginBottom: 10 }}>
                Zahlungen nach Art
              </Interaction.H3>
              <Table groups={methods} />
              <Interaction.H3 style={{ marginTop: 20, marginBottom: 10 }}>
                Liste der Zahlungen
              </Interaction.H3>
              <TableRaw>
                <tbody {...tableStyles.alternateRowBg}>
                  <tr>
                    <th {...tableStyles.th}>Name</th>
                    <th {...tableStyles.th}>Package</th>
                    <th {...tableStyles.th}>Status</th>
                    <th {...tableStyles.thNum}>CHF</th>
                    <th {...tableStyles.thNum}>Created</th>
                    <th {...tableStyles.thNum}>Updated</th>
                    <th {...tableStyles.thNum}>Account</th>
                  </tr>
                  {transactionItems.map((transactionItem) => (
                    <tr key={transactionItem.id}>
                      <td {...tableStyles.td}>
                        <Link
                          href={`/users/${transactionItem.userId}`}
                          passHref
                        >
                          <Editorial.A>{transactionItem.name}</Editorial.A>
                        </Link>
                      </td>
                      <td {...tableStyles.td}>{transactionItem.packageName}</td>
                      <td {...tableStyles.td}>{transactionItem.status}</td>
                      <td {...tableStyles.tdNum}>
                        {transactionItem.total / 100}
                      </td>
                      <td {...tableStyles.tdNum}>
                        <span
                          style={{
                            backgroundColor: transactionItem.createdAtInFilter
                              ? '#9AFD98'
                              : undefined,
                          }}
                        >
                          {displayDate(transactionItem.createdAt)}
                        </span>
                      </td>
                      <td {...tableStyles.tdNum}>
                        <span
                          style={{
                            backgroundColor: transactionItem.updatedAtInFilter
                              ? '#9AFD98'
                              : undefined,
                          }}
                        >
                          {displayDate(transactionItem.updatedAt)}
                        </span>
                      </td>
                      <td {...tableStyles.tdNum}>
                        {transactionItem.accountDates.map(
                          (accountDate, index) =>
                            accountDate && (
                              <span
                                key={index}
                                style={{
                                  backgroundColor: transactionItem
                                    .accountDatesInFilter?.[index]
                                    ? '#9AFD98'
                                    : undefined,
                                }}
                              >
                                {displayDate(accountDate)}
                              </span>
                            ),
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableRaw>
              <Interaction.H3 style={{ marginTop: 20, marginBottom: 10 }}>
                Insgesamt bezahlte Mitgliedschaftstage pro Jahr
              </Interaction.H3>
              <Table groups={membershipDays} columnLabels={['Tage', 'Wert']} />
            </div>
          )
        }}
      />
    </>
  )
}

export default Live
