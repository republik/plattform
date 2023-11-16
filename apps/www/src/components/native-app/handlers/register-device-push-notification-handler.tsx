'use client'

import useNativeAppEvent from '@app/lib/hooks/useNativeAppEvent'

export function NARegisterDevicePushNotificationHandler() {
  // const [upsertDevice] = useMutation()
  useNativeAppEvent('onPushRegistered', (content) => {
    //  const { token, os, osVersion, model, appVersion, userAgent } = content.data
    //  upsertDevice({
    //    variables: {
    //      token,
    //      information: {
    //        os,
    //        osVersion,
    //        model,
    //        appVersion,
    //        userAgent,
    //      },
    //    },
    //  })

    console.log('onPushRegistered', content)
  })

  return null
}
