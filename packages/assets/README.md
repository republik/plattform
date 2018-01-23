# @orbiting/backend-modules-assets

express routes and libs to get and handle assets.

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
  ENVs: `RENDER_URL_WHITELIST`: comma separated, accept: :url.indexOf(whiteUrl) === 0

- `/s3/:bucket/:path*(.webp)`
  fetches resources from a S3 bucket.
  ENVs: `AWS_BUCKET_WHITELIST`: comma separated, format: `bucket:region,bucket:region`

- `/frontend/:path*(.webp)`
  fetches :path from `FRONTEND_BASE_URL`
  ENVs: `FRONTEND_BASE_URL`


### Query params

If not specified otherwise all endpoints honour the following query params:
- `resize=:width[x:height]`
  resizes an image to the specified dimensions. center-cropped if dimensions don't match

- `bw=true`
  greyscale an image
