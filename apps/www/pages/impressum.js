import Frame from '../components/Frame'
import Page from '../components/Imprint/Page'
import { withDefaultSSR } from '../lib/apollo/helpers'

const ImprintPage = () => {
  const meta = {
    title: 'Impressum',
    description: 'Die Köpfe hinter der Republik.',
  }
  return (
    <Frame meta={meta}>
      <Page />
    </Frame>
  )
}

export default withDefaultSSR(ImprintPage)
