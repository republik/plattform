export const shouldRenderPlayButton = ({ urlMeta }) => {
  // because React, we need "undefined" rather than "false" here
  return urlMeta?.hasAudio ? true : undefined
}
