export const shouldRenderPlayButton = ({ urlMeta }) =>
  urlMeta?.hasAudio && urlMeta?.audioSourceKind !== 'syntheticReadAloud'
    ? true
    : undefined
