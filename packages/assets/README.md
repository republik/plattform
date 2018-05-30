# @orbiting/backend-modules-assets

This module contains libs to un-/prefix relative asset urls, upload to S3 and most importantly express middlewares for asset proxying and image manipulation (resizing, greyscaling, webp format transformation). It streams assets from other urls, from s3 buckets, out of github repos and can render webpages to PNGs.

Check [assets-backend](https://github.com/orbiting/assets-backend) for a deployable, standalone, express wrapper.

## URLs

### Endpoints

- `/github/:org/:repo/.../gitObjectId.suffix(.webp)`

  gets the blob identified by it's :gitObjectId from github :org/:repo

  ENVs: `GITHUB_LOGIN`, `GITHUB_APP_ID`, `GITHUB_APP_KEY`, `GITHUB_INSTALLATION_ID`

- `/proxy(.webp)?originalURL=:url&mac=:mac`

  proxies :originalURL

  ENVs: `ASSETS_HMAC_KEY`

- `/render?url=:url&width=:width&height=:height`

  renders :url with a viewport of :width x :hight to a png. webp conversion not supported.

  ENVs: `PHANTOMJSCLOUD_API_KEY`, `RENDER_URL_WHITELIST`: comma separated, accept: :url.indexOf(whiteUrl) === 0, `FRONTEND_BASIC_AUTH_USER`, `FRONTEND_BASIC_AUTH_PASS`

- `/s3/:bucket/:path*(.webp)`

  fetches resources from a S3 bucket.

  ENVs: `AWS_BUCKET_WHITELIST`: comma separated, format: `bucket:region,bucket:region`

- `/frontend/:path*(.webp)`

  fetches :path from `FRONTEND_BASE_URL`

  ENVs: `FRONTEND_BASE_URL`, `FRONTEND_BASIC_AUTH_USER`, `FRONTEND_BASIC_AUTH_PASS`

- `/pdf/:path*`

  fetches :path from `PDF_BASE_URL`

  ENVs: `PDF_BASE_URL`

- `/purgeTags?psk=psk&tags=tag1,tag2`

  purges tags on keyCDN :path from `PDF_BASE_URL`

  ENVs: `PURGE_PSK`

### Query params

If not specified otherwise all endpoints honour the following query params:
- `resize=:width[x:height]`
  resizes an image to the specified dimensions. center-cropped if dimensions don't match

- `bw=true`
  greyscale an image
