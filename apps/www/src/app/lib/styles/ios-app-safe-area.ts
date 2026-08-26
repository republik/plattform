import { css } from '@republik/theme/css'

/**
 * `env(safe-area-inset-bottom)` does not resolve inside `react-native-webview`
 * on iOS, so bottom-anchored fixed elements end up under the home indicator.
 * See https://github.com/react-native-webview/react-native-webview/issues/155
 *
 * Workaround: add the inset as a bottom margin, matched per device via media
 * queries. Only meaningful on a `position: fixed` element anchored with
 * `bottom`, where a bottom margin shifts the box up.
 *
 * Keep in sync with the `iOSSafeInsets` rule in
 * `components/Audio/AudioPlayer/AudioPlayer.tsx` — the values there are these
 * insets plus the player's own 15px margin. Newer devices are missing from both
 * lists; they fall back to no extra inset.
 */
export const iosAppSafeAreaBottomStyle = css({
  // iPhone 14, 13, 12
  '@media only screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)':
    { marginBottom: '34px' },
  '@media only screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)':
    { marginBottom: '21px' },
  // iPhone 13 mini, 12 mini, 11 Pro, Xs, X
  '@media only screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)':
    { marginBottom: '34px' },
  '@media only screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)':
    { marginBottom: '21px' },
  // iPhone 11, XR
  '@media only screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)':
    { marginBottom: '34px' },
  '@media only screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)':
    { marginBottom: '21px' },
  // iPhone 17 Pro, 17, 16 Pro
  '@media only screen and (device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)':
    { marginBottom: '34px' },
  '@media only screen and (device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)':
    { marginBottom: '21px' },
})

/**
 * Same insets as `iosAppSafeAreaBottomStyle`, as `padding-bottom` instead of
 * `margin-bottom` — for applying to a `position: fixed; inset: 0` backdrop
 * (e.g. a `Dialog.Overlay`) that must keep covering the full viewport. Margin
 * would shrink the backdrop's own box away from the bottom edge, exposing
 * whatever sits behind it there; padding only shrinks the content area, so a
 * `placeItems: 'end stretch'` child is pushed up while the backdrop still
 * paints all the way down.
 */
export const iosAppSafeAreaBottomPaddingStyle = css({
  // iPhone 14, 13, 12
  '@media only screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)':
    { paddingBottom: '34px' },
  '@media only screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)':
    { paddingBottom: '21px' },
  // iPhone 13 mini, 12 mini, 11 Pro, Xs, X
  '@media only screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)':
    { paddingBottom: '34px' },
  '@media only screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)':
    { paddingBottom: '21px' },
  // iPhone 11, XR
  '@media only screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)':
    { paddingBottom: '34px' },
  '@media only screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)':
    { paddingBottom: '21px' },
  // iPhone 17 Pro, 17, 16 Pro
  '@media only screen and (device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)':
    { paddingBottom: '34px' },
  '@media only screen and (device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)':
    { paddingBottom: '21px' },
})
