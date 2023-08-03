import React from 'react'
import Link from 'next/link'
import {
  InfoBox,
  InfoBoxTitle,
  InfoBoxText,
  Figure,
  Editorial,
} from '@project-r/styleguide'
import { useTranslation } from '../../../lib/withT'
import {
  CLIMATE_LAB_LANDINGPAGE_URL,
  CLIMATE_LAB_ROLE,
  CLIMATE_LAB_URL,
} from '../constants'
import { useMe } from '../../../lib/context/MeContext'
import ClimateLabLogo from '../shared/ClimateLabLogo'

const ClimateLabInlineTeaser: React.FC<{ hideForMembers?: boolean }> = ({
  hideForMembers = false,
}) => {
  const { t } = useTranslation()
  const { me } = useMe()
  const isClimateLabMember = me?.roles?.includes(CLIMATE_LAB_ROLE)

  if (isClimateLabMember && hideForMembers) return null

  return (
    <InfoBox figureSize='XXS'>
      <InfoBoxTitle>{t('ClimateInlineTeaser/content/title')}</InfoBoxTitle>
      <Figure>
        <ClimateLabLogo width={80} height={80} hideFigcaption />
      </Figure>
      <InfoBoxText>
        {isClimateLabMember ? (
          <>
            {t('ClimateInlineTeaser/Member/content/text')}{' '}
            <Link href={CLIMATE_LAB_URL} legacyBehavior>
              <Editorial.A>
                {t('ClimateInlineTeaser/Member/content/link')}
              </Editorial.A>
            </Link>
            {'.'}
          </>
        ) : (
          <>
            {t('ClimateInlineTeaser/NonMember/content/text')}{' '}
            <Link href={CLIMATE_LAB_LANDINGPAGE_URL} legacyBehavior>
              <Editorial.A>
                {t('ClimateInlineTeaser/NonMember/content/link')}
              </Editorial.A>
            </Link>
            {'.'}
          </>
        )}
      </InfoBoxText>
    </InfoBox>
  );
}

export default ClimateLabInlineTeaser
