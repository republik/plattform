import { css } from '@republik/theme/css'

import { Collapsible } from '@app/components/ui/collapsible'

import { CDN_FRONTEND_BASE_URL } from 'lib/constants'
import { useTranslation } from 'lib/withT'

import { PaynoteSection } from '../../ui/containers'
import TrialForm from '../../auth/trial'

import Login from './login'

const TrialHeader = ({ variation }: { variation: string }) => {
  const { t } = useTranslation()
  return (
    <div
      className={css({
        display: 'flex',
        flexDir: 'column',
        gap: '4',
        pb: '4',
      })}
    >
      <Login />
      <div
        className={css({ display: 'flex', justifyContent: 'center', py: '6' })}
      >
        <img
          src={`${CDN_FRONTEND_BASE_URL}/static/regwall/illustration.png`}
          alt='Illustration registration wall'
        />
      </div>
      <h2>{t(`regwall/${variation}/header/title`)}</h2>
      <div className={css({ textStyle: 'airy' })}>
        <p
          dangerouslySetInnerHTML={{
            __html: t(`regwall/${variation}/header/description`),
          }}
        />
      </div>
    </div>
  )
}

const WhyRegister = () => {
  const { t } = useTranslation()

  return (
    <div
      className={css({
        mt: '4',
        backgroundColor: 'rgba(0,0,0,0.07)',
        borderRadius: '3x',
        p: '4',
      })}
    >
      <Collapsible title={t('regwall/whyRegister/title')}>
        <div
          className={css({
            display: 'flex',
            flexDir: 'column',
            gap: '4',
            mt: '4',
          })}
          dangerouslySetInnerHTML={{
            __html: t('regwall/whyRegister/expanded'),
          }}
        />
      </Collapsible>
    </div>
  )
}

const Trial = ({
  analyticsProps,
}: {
  analyticsProps: { variation: string }
}) => {
  return (
    <PaynoteSection>
      <TrialForm
        renderBefore={<TrialHeader variation={analyticsProps.variation} />}
        renderAfter={<WhyRegister />}
        analyticsProps={analyticsProps}
      />
    </PaynoteSection>
  )
}

export default Trial
