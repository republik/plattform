# @orbiting/lambdas-chromium

API to puppeteer - chromium.

[screenshot.js](screenshots.js) is a NodeJS [request](https://nodejs.org/api/http.html#http_event_request)-[response](https://nodejs.org/api/http.html#http_class_http_serverresponse)-handler to generate screenshots.

[puppeteer]('https://github.com/GoogleChrome/puppeteer') tries to use locally available chromium (by [chrome-aws-lambda](https://github.com/alixaxel/chrome-aws-lambda)) otherwise tries to fall back to connect to `PUPPETEER_WS_ENDPOINT`


## ENVs

see [.env.example]

```
now secret url_whitelist https://www.republik.ch,https://republik.ch
now -e URL_WHITELIST=@url_whitelist
```


## Endpoints
- screenshot.js
  - example query: `/?url=:url&[width=[:w]x[:h]]&[zoomFactor=:sf]&[fullPage=:fp]&[cookie=:c]&[basicAuthUser=:u]&[basicAuthPass=:p]`
  - renders ?url
  - optional &width &height
    - default 1200x1
  - optional &fullPage
    - default true
    - this api screenshots the full page per default (with scrolling), set `fullPage` to `false` or `0` to crop to viewport
  - optional &zoomFactor
    - requires viewport or w/h
    - default 1
  - optional &cookie
    - example: 'id=208h2n'
  - optional &basicAuthUser &basicAuthPass
    - send basic auth when requesting ?url


## Credits

Inspired by: [now-examples puppeteer-screenshot](https://github.com/zeit/now-examples/tree/master/puppeteer-screenshot)
