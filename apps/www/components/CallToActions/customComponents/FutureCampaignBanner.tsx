import {
  useColorContext,
  fontStyles,
  mediaQueries,
  IconButton,
  CloseIcon,
  plainButtonRule,
  Center,
} from '@project-r/styleguide'
import { motion } from 'framer-motion'
import { css } from 'glamor'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import { withDarkMode } from '../../FutureCampaign/withDarkMode'
import { CATComponentBaseProps } from '../CustomComponentBase'

const HIDE_ON_PATHNAMES: string[] = [
  '/404',
  '/angebote',
  '/abgang',
  '/cockpit',
  '/verstaerkung-holen',
]

function FutureCampaignBanner({
  callToAction,
  handleAcknowledge,
}: CATComponentBaseProps) {
  const [colorScheme] = useColorContext()
  const router = useRouter()
  // TODO: use intersection observer to check if the motion-div is in the top 50 % of the viewpoert
  // if so set visitedPageTop to true -> show the banner
  // this will prevent the banner from showing up on the first page load
  // if the user is somewhere in the middle of the page
  const [visitedPageTop, setVisitedPageTop] = useState(true)
  // Keep track on whether the banner has been rendered before
  // if so we don't want to animate it in again.
  const [renderedCta, setRenderedCTA] = useState<boolean>(() => {
    return Boolean(sessionStorage.getItem(`cta-${callToAction.id}`))
  })

  const daysLeft = useMemo(() => {
    const now = new Date()
    const end = new Date(callToAction.endAt)
    const diff = end.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 3600 * 24))
    return days
  }, [callToAction.endAt])

  const showBanner =
    !HIDE_ON_PATHNAMES.includes(router.pathname) && visitedPageTop

  const { sender = 834, receiver = '1’944' } =
    callToAction?.payload?.customComponent?.args || {}

  return (
    <motion.div
      {...colorScheme.set('backgroundColor', 'default')}
      {...colorScheme.set('color', 'text')}
      {...colorScheme.set('borderColor', 'divider')}
      style={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderBottom: '1px solid',
      }}
      initial={!renderedCta ? { opacity: 0, height: 0 } : undefined}
      animate={
        !renderedCta && showBanner ? { opacity: 1, height: 'auto' } : undefined
      }
      onAnimationComplete={() => {
        sessionStorage.setItem(`cta-${callToAction.id}`, 'true')
        setRenderedCTA(true)
      }}
      exit={!renderedCta ? { opacity: 0, height: 0 } : undefined}
      transition={{ duration: 0.5, delay: 0.5, bounce: 0, ease: 'easeIn' }}
    >
      <Center>
        <div {...styles.wrapper}>
          <div
            {...css({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 16,
            })}
          >
            <h2 {...styles.heading}>
              Dank {sender} Verlegerinnen wurde die Republik um {receiver}{' '}
              Stimmen reicher.{' '}
            </h2>
            <button
              {...plainButtonRule}
              {...styles.action}
              onClick={() => {
                router.push('/verstaerkung-holen')
                handleAcknowledge()
              }}
            >
              Noch {daysLeft} Tage Verstärkung holen und Gratismonate sichern.
            </button>
          </div>
          <div {...styles.close}>
            <IconButton
              Icon={CloseIcon}
              size={24}
              onClick={() => {
                handleAcknowledge()
              }}
            />
          </div>
        </div>
      </Center>
    </motion.div>
  )
}

export default withDarkMode(FutureCampaignBanner)

const styles = {
  wrapper: css({
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'row',
    gap: 0,
    padding: '24px 0',
    [mediaQueries.mUp]: {
      gap: 16,
      padding: '43px 0',
    },
  }),
  heading: css({
    gridColumn: 1,
    gridRow: 1,
    margin: 0,
    ...fontStyles.serifTitle26,
    lineHeight: 1.3,
    [mediaQueries.mUp]: {
      ...fontStyles.serifTitle38,
    },
  }),
  action: css({
    textDecoration: 'underline',
    ...fontStyles.sansSerif,
    textAlign: 'start',
    fontsize: 14,
    [mediaQueries.mUp]: {
      fontsize: 17,
    },
  }),
  close: css({
    display: 'flex',
    alignItems: 'flex-end',
    [mediaQueries.mUp]: {
      alignItems: 'flex-start',
    },
  }),
}
