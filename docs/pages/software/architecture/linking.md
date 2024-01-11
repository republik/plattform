# Linking

This document describes how links will open, as it may not work as you'd expect.

It heavily depends on environment (e.g. Desktop, iOS, Android, Apps) and settings (e.g. apple-app-site-association).

```mermaid
graph TD
    linkClick["User clicks link"] --> isGotoLink("hostname is
      - goto.republik.ch
      - goto.republik.love
    (@see 'Goto-Link' in Notes)
    ")
    isGotoLink -- Yes --> openInBrowser("open in Browser")
    isGotoLink -- No --> isRepublikLink("hostname is
      - www.republik.ch
      - republik.ch
      - www.republik.love
      - republik.love
      (@see 'Republik-Link' in Notes)
    ")
    isRepublikLink -- No --> openInBrowser
    isRepublikLink -- Yes --> inApp("in App already"?)
    inApp -- Yes --> openInApp("open in App")
    inApp -- No --> isAppInstalled("is App installed?")
    isAppInstalled -- No --> openInBrowser
    isAppInstalled -- "Yes (Android)" --> openInApp
    isAppInstalled -- "Yes (iOS)" --> isPathExcluded("is path excluded (iOS)")
    isPathExcluded -- No --> openInApp
    isPathExcluded -- Yes --> openInBrowser
```

### Notes

A "Goto-Link" points to a [goto](../applications/goto.mdx) instance.

A "Republik-Link" is a link which has a hostname in [republikapp.entitlements](https://github.com/republik/app/blob/main/ios/republikapp/republikapp.entitlements) (iOS version), and schema and hostname in [AndroidManifest.xml](https://github.com/republik/app/blob/main/android/app/src/main/AndroidManifest.xml) (Android version).

A path on iOS maybe excluded via [.well-known/apple-app-site-association](https://github.com/republik/plattform/blob/main/apps/www/public/.well-known/apple-app-site-association).
