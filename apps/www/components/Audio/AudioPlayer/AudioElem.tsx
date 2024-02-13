import React from 'react'

type AudioElementProps = React.ComponentPropsWithRef<'audio'>

const AudioElement = React.forwardRef<HTMLAudioElement, AudioElementProps>(
  (props, ref) => {
    const { src, ...rest } = props

    // // Handle media-element errors
    // const onError = useCallback(() => {
    //   if (mediaRef.current && mediaRef.current.error) {
    //     const error = mediaRef.current.error
    //     const errorObject = {
    //       message: error.message,
    //       code: error.code,
    //       MEDIA_ERR_ABORTED: error.MEDIA_ERR_ABORTED,
    //       MEDIA_ERR_NETWORK: error.MEDIA_ERR_NETWORK,
    //       MEDIA_ERR_DECODE: error.MEDIA_ERR_DECODE,
    //     }
    //     handleError(new Error(JSON.stringify(errorObject, null, 2)))
    //   }
    // }, [handleError])

    return <audio ref={ref} src={src} {...rest} />
  },
)
