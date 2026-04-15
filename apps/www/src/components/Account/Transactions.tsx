import { TransactionsDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { Loader } from '@project-r/styleguide'
import { css } from '@republik/theme/css'

export function Transactions() {
  const { data, loading, error } = useQuery(TransactionsDocument)

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const transactions = data.me?.transactions ?? []

        return (
          <table className={css({ width: 'full' })}>
            <tbody>
              {transactions.map(
                ({ id, amount, company, createdAt, __typename }) => {
                  let label = 'Transaktion'

                  switch (__typename) {
                    case 'SubscriptionTransaction':
                      label = company === 'PROJECT_R' ? 'Mitgliedschaft' : 'Abo'
                      break
                    case 'GiftTransaction':
                      label =
                        company === 'PROJECT_R'
                          ? 'Geschenk-Mitgliedschaft'
                          : 'Geschenk-Abo'
                      break
                    case 'PledgeTransaction':
                      // TODO: Figure out how to label this insanity
                      break
                  }

                  return (
                    <tr
                      className={css({
                        borderBottomColor: 'divider',
                        borderBottomStyle: 'solid',
                        borderBottomWidth: 1,
                      })}
                      key={id}
                    >
                      <td className={css({ py: '2' })}>
                        {new Date(createdAt).toLocaleDateString('de-CH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                      <td className={css({ py: '2' })}>{label}</td>
                      <td className={css({ py: '2', textAlign: 'right' })}>
                        CHF {(amount / 100).toFixed(2)}
                      </td>
                    </tr>
                  )
                },
              )}
            </tbody>
          </table>
        )
      }}
    ></Loader>
  )
}
