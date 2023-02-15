import { css } from 'glamor'
import {
  fontStyles,
  mediaQueries,
  ColorContextProvider,
} from '@project-r/styleguide'
import FutureCampaignPage from '../../components/FutureCampaign/FutureCampaignPage'
import Meta from '../../components/Frame/Meta'

const FiveYearsIndexPage = () => {
  return (
    <FutureCampaignPage>
      <Meta
        data={{
          pageTitle: 'Werden Sie Teil der Republik',
          title: 'Werden Sie Teil der Republik',
        }}
      />
      <h1 {...styles.heading}>
        Unabhängiger Journalismus hat Zukunft – mit Ihnen.
      </h1>
      <p {...styles.text}>
        Geld ist nicht alles. Köpfe schon. Zum 5-Jahres-Jubiläum sind unsere
        Mitglieder dazu eingeladen, bis zu 5 Mitstreiterinnen an Bord zu holen.
        Diese erhalten ein Jahr lang die Republik zu einem Preis, der für sie
        stimmt.
      </p>
      <p {...styles.text}>Möchten Sie von dem Angebot profitieren?</p>
      <p {...styles.text}>
        Dann melden Sie sich bei einer Republik-Verlegerin und fragen Sie nach
        dem Link zum Mitstreiter-Abo.
      </p>
    </FutureCampaignPage>
  )
}

export default function WrappedPage() {
  return (
    <ColorContextProvider colorSchemeKey='dark'>
      <FiveYearsIndexPage />
    </ColorContextProvider>
  )
}

const styles = {
  heading: css({
    ...fontStyles.serifTitle,
    margin: 0,
    fontSize: 24,
    lineHeight: 1.3,
    marginBottom: 28,
    [mediaQueries.mUp]: {
      fontSize: 36,
    },
  }),
  text: css({
    ...fontStyles.sansSerifRegular,
    margin: 0,
    fontSize: 19,
    lineHeight: '1.4em',
    [mediaQueries.mUp]: {
      fontSize: 21,
    },
    '& + p': {
      margin: `16px 0 0 0`,
    },
  }),
}
