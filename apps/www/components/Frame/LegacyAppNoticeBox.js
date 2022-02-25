import React from 'react'
import { css } from 'glamor'
import {
  A,
  Button,
  Center,
  Interaction,
  mediaQueries,
} from '@project-r/styleguide'
import Box from './Box'
import { useInNativeApp } from '../../lib/withInNativeApp'
import { Breakout } from '@project-r/styleguide'

const styles = {
  actions: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    '> *:not(:last-child)': {
      marginBottom: 16,
    },
    [mediaQueries.mUp]: {
      width: 'auto',
      flexDirection: 'row',
      '> *:not(:last-child)': {
        marginBottom: 0,
        marginRight: 16,
      },
    },
  }),
  primaryAction: css({
    width: '100%',
    [mediaQueries.mUp]: {
      width: 'auto',
    },
  }),
}

const LegacyAppNoticeBox = ({ t }) => {
  const { inIOS } = useInNativeApp()

  return (
    <Box>
      <Center>
        <Breakout size='breakout'>
          <Interaction.P style={{ marginBottom: '1rem' }}>
            {t('components/outdatedAppVersion/text')}
          </Interaction.P>
          <div {...styles.actions}>
            {inIOS ? (
              <Button
                href='https://apps.apple.com/ch/app/republik/id1392772910'
                primary
                target='_blank'
                attributes={styles.primaryAction}
              >
                {t('components/outdatedAppVersion/ios/primaryAction')}
              </Button>
            ) : (
              <>
                <Button
                  href='https://play.google.com/store/apps/details?id=app.republik'
                  primary
                  target='_blank'
                  attributes={styles.primaryAction}
                >
                  {t('components/outdatedAppVersion/android/primaryAction')}
                </Button>
                <A
                  href='https://www.republik.ch/app/apk/latest'
                  target='_blank'
                >
                  {t('components/outdatedAppVersion/android/secondaryAction')}
                </A>
              </>
            )}
          </div>
        </Breakout>
      </Center>
    </Box>
  )
}

export default LegacyAppNoticeBox
