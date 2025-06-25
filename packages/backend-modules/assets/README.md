# @orbiting/backend-modules-assets

This module contains libs to un-/prefix relative asset urls, upload to S3 and most importantly express middlewares for asset proxying and image manipulation (resizing, greyscaling, webp format transformation). It streams assets from other urls, from s3 buckets, out of github repos and can render webpages via external services.

For rendering it calls [lambdas/chromium](lambdas/chromium) via `CHROMIUM_LAMBDA_URL`.

Check [assets-backend](https://github.com/orbiting/assets-backend) for a deployable, standalone, express wrapper.

## ENVs

See [apps/assets/.env.example](apps/assets/.env.example) for the required envs.

## URLs

### Endpoints

- `/proxy(.webp)?originalURL=:url&mac=:mac`

  proxies :originalURL

  ENVs: `ASSETS_HMAC_KEY`

- `/render?url=:url&[viewport=[:width]x[:height]]...`

  - renders :url
  - optional :viewport
    - succeeds deprecated: `width=:width&height=:height`
    - default 1200x1
  - many more params are supported, check [README](lambdas/chromium/README.md) of the renderer.

  ENVs: check [README](lambdas/chromium/README.md)

- `/s3/:bucket/:path*(.webp)`

  fetches resources from a S3 bucket.

  ENVs: `AWS_BUCKET_ALLOWLIST`: comma separated, format: `bucket:region,bucket:region`

- `/frontend/:path*(.webp)`

  fetches :path from `FRONTEND_BASE_URL`

### Query params

If not specified otherwise all endpoints honour the following query params:

- `resize=:width[x:height]`
  resizes an image to the specified dimensions. center-cropped if dimensions don't match

- `bw=true`
  greyscale an image

- `format=[jpeg|png|webp]`
  transform format if necessary
