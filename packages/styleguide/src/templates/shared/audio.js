export const shouldRenderPlayButton = ({ urlMeta }) =>
  // if I remember correctly we need "undefined", not "false" here
  urlMeta?.hasAudio ? true : undefined
