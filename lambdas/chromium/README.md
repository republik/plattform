# @orbiting/lambdas-chromium

API to puppeteer - chromium.

[screenshot.js](screenshots.js) is a NodeJS [request](https://nodejs.org/api/http.html#http_event_request)-[response](https://nodejs.org/api/http.html#http_class_http_serverresponse)-handler to generate screenshots.

[puppeteer]('https://github.com/GoogleChrome/puppeteer') tries to use locally available chromium (by [chrome-aws-lambda](https://github.com/alixaxel/chrome-aws-lambda)) otherwise tries to fall back to connect to `PUPPETEER_WS_ENDPOINT`


## ENVs

see [.env.example]

```
now -e URL_WHITELIST=https://republik.ch,https://www.republik.ch,https://republik.love,https://www.republik.love,https://github.com

```


## Endpoints
- screenshot.js
  - example query: `/?url=:url[&width=:w][&heigth=:h][&zoomFactor=:sf][&fullPage=:fp][&format=:f][&quality=:q][&cookie=:c][&basicAuthUser=:u][&basicAuthPass=:p]`
  - renders ?url
  - optional &width &height
    - default `1200x1`
  - optional &fullPage
    - default `1`
    - this api screenshots the full page per default (with scrolling), set `fullPage` to `0` to crop to viewport
  - optional &zoomFactor
    - default 1
  - optional &cookie
    - example: 'id=something'
  - optional &basicAuthUser &basicAuthPass
    - send basic auth when requesting ?url
  - optional &format
    - default `png`
    - supports `png`, `jpeg`
  - optional &quality
    - only for `jpeg`


## Credits

Inspired by: [now-examples puppeteer-screenshot](https://github.com/zeit/now-examples/tree/master/puppeteer-screenshot)
