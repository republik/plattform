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
import { useMemo, useRef, useState } from 'react'
import { withDarkMode } from '../../FutureCampaign/withDarkMode'
import { CATComponentBaseProps } from '../CustomComponentBase'
import { useIntersectionObserver } from '../../../lib/hooks/useIntersectionObserver'

const HIDE_ON_PATHNAMES: string[] = [
  '/404',
  '/angebote',
  '/abgang',
  '/cockpit',
  '/verstaerkung-holen',
]

// we want to ensure that the banner is only animated once per page reload
let campaignBannerHasBeenRenderd = false

function FutureCampaignBanner({
  callToAction,
  handleAcknowledge,
}: CATComponentBaseProps) {
  const [colorScheme] = useColorContext()
  const router = useRouter()
  const elemRef = useRef<HTMLDivElement>(null)
  const [renderedCta, setRenderedCTA] = useState<boolean>(
    campaignBannerHasBeenRenderd,
  )
  // Keep tack on whether the banner has been in the viewport
  // Only aniamte in the banner once the page top has been visited
  const [visitedPageTop, setVisitedPageTop] = useState(false)
  useIntersectionObserver(elemRef, {
    callback: (value: boolean) => {
      if (value) {
        setVisitedPageTop(true)
      }
    },
    intersectionObserverOptions: {
      threshold: 0.5,
    },
  })

  const daysLeft = useMemo(() => {
    const now = new Date()
    const end = new Date(callToAction.endAt)
    const diff = end.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 3600 * 24))
    return days
  }, [callToAction.endAt])

  const showBanner = !HIDE_ON_PATHNAMES.includes(router.pathname)

  const { sender = 834, receiver = '1’944' } =
    callToAction?.payload?.customComponent?.args || {}

  if (!showBanner) {
    return null
  }

  return (
    <motion.div
      ref={elemRef}
      {...colorScheme.set('backgroundColor', 'default')}
      {...colorScheme.set('color', 'text')}
      {...colorScheme.set('borderColor', 'divider')}
      style={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // Hide border on front
        borderBottom: router.pathname !== '/front' ? '1px solid' : '0px solid',
      }}
      initial={
        renderedCta ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }
      }
      animate={visitedPageTop ? { opacity: 1, height: 'auto' } : undefined}
      onAnimationComplete={() => {
        campaignBannerHasBeenRenderd = true
        setRenderedCTA(true)
      }}
      transition={{ duration: 0.5, delay: 0.3, bounce: 0, ease: 'easeIn' }}
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
              Dank {sender} Verlegerinnen ist die Republik um {receiver} Stimmen
              reicher geworden.{' '}
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
