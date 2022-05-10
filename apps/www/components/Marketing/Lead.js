import { css } from 'glamor'
import {
  Container,
  Logo,
  mediaQueries,
  Editorial,
  fontStyles,
} from '@project-r/styleguide'

export default function LeadSection({ t }) {
  return (
    <>
      <Container {...styles.container}>
        <div {...styles.logo}>
          <Logo />
        </div>
        <h2 {...styles.lead}>{t('marketing/page/lead/subtitle')}</h2>
      </Container>
      <Container {...styles.description}>
        <Editorial.P>{t('marketing/page/minifront/description')}</Editorial.P>
      </Container>
    </>
  )
}

const styles = {
  container: css({
    minHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  lead: css({
    ...fontStyles.serifRegular,
    fontSize: 24,
    lineHeight: '36px',
    textAlign: 'center',
    width: '100%',
    maxWidth: 960,
    marginBottom: 0,
    [mediaQueries.mUp]: {
      fontSize: 36,
      lineHeight: '48px',
    },
  }),
  logo: css({
    width: 200,
    [mediaQueries.mUp]: {
      width: 400,
    },
  }),
  description: css({
    textAlign: 'center',
    margin: '16px auto',
  }),
}
