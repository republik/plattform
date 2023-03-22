import {
  useColorContext,
  fontStyles,
  mediaQueries,
  IconButton,
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
import { useTranslation } from '../../../lib/withT'
import { IconClose } from '@republik/icons'

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
  const { t } = useTranslation()
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

  const { sender = '1162', receiver = '2121' } =
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
              {t(
                'CallToActions/customComponents/FutureCampaignBanner/headline',
                { sender, receiver },
              )}
            </h2>
            <button
              {...plainButtonRule}
              {...styles.action}
              onClick={() => {
                router.push('/verstaerkung-holen')
                handleAcknowledge()
              }}
            >
              {t.pluralize(
                'CallToActions/customComponents/FutureCampaignBanner/button',
                { count: daysLeft, daysLeft },
              )}
            </button>
          </div>
          <div {...styles.close}>
            <IconButton
              Icon={IconClose}
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
    padding: '12px 0 18px',
    [mediaQueries.mUp]: {
      gap: 16,
      padding: '28px 0 32px',
    },
  }),
  heading: css({
    gridColumn: 1,
    gridRow: 1,
    margin: 0,
    ...fontStyles.sansSerifMedium20,
    lineHeight: 1.3,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifMedium26,
      lineHeight: 1.2,
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
