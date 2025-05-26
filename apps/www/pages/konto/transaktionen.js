import AccountTabs from '../../components/Account/AccountTabs'
import { AccountEnforceMe } from '../../components/Account/Elements'
import Frame from '../../components/Frame'
import { withDefaultSSR } from '../../lib/apollo/helpers'
import withT from '../../lib/withT'
// import PledgeList from '../../components/Account/PledgeList'
import { Transactions } from '../../components/Account/Transactions'

const TransactionPage = ({ t }) => {
  return (
    <Frame
      meta={{
        title: t('pages/account/transactions/title'),
      }}
    >
      <AccountEnforceMe>
        <AccountTabs />
        {/* <PledgeList highlightId={query.id} /> */}
        <Transactions />
      </AccountEnforceMe>
    </Frame>
  )
}

export default withDefaultSSR(withT(TransactionPage))
