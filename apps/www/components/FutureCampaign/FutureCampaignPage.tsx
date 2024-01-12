import { useColorContext } from '@project-r/styleguide'
import { css } from 'glamor'
import Head from 'next/head'
import { ReactNode, useMemo } from 'react'
import FutureCampaignHeader from './ReceiverPage/FutureCampaignHeader'

type FutreCampaignPageProps = {
  children?: ReactNode
}

const FutureCampaignPage = ({ children }: FutreCampaignPageProps) => {
  const [colorScheme] = useColorContext()

  const scrollbarStyle = useMemo(
    () =>
      css({
        '&::-webkit-scrollbar': {
          height: 6,
          width: 6,
          backgroundColor: colorScheme.getCSSColor('hover'),
          borderRadius: 10,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: colorScheme.getCSSColor('divider'),
          borderRadius: 10,
        },
      }),
    [colorScheme],
  )

  return (
    <div {...styles.pageWrapper}>
      <Head>
        <meta name='theme-color' content={colorScheme.getCSSColor('default')} />
      </Head>
      <div {...styles.page} {...scrollbarStyle}>
        <div {...styles.header}>
          <FutureCampaignHeader />
        </div>
        <div {...styles.content}>{children}</div>
      </div>
    </div>
  )
}

export default FutureCampaignPage

const styles = {
  pageWrapper: css({
    display: 'flex',
    minHeight: ['100vh', '100dvh'],
  }),
  page: css({
    height: ['100vh', '100dvh'],
    display: 'grid',
    width: '100%',
    gap: 8,
    gridTemplateRows: 'auto 1fr',
    maxWidth: 600,
    maxHeight: 800,
    margin: 'auto',
    position: 'relative',
    overflowY: 'auto',
    '::-webkit-scrollbar-track': {
      background: '#1F1F1F',
    },
    '::-webkit-scrollbar-thumb': {
      background: '#4C4D4C',
    },
  }),
  header: css({
    position: 'sticky',
    top: 0,
    zIndex: 1,
  }),
  content: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 15px',
  }),
}
