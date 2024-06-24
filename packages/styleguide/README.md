This is a living style guide. Subject to constant change.

It documents the current state and provides implemented React components, published as an npm package.

## About

The development started on March 5th 2017 for the crowdfunding of [republik.ch](https://www.republik.ch/). It has since been continuously expanded and now provides a wide range of functionality from [colors](/colors) and [typography](/typography) definitions, to an [video player](/videoplayer), common [form elements](/forms), [discussion trees](/components/discussion/tree), a full suite of editorial elements—from teasers to infoboxes, template definitions targeting [web](/templates/article) and [email](/templates/editorialnewsletter) and a [charting system](/charts).

It's currently primarly used to power our web and cms frontends—[republik-frontend](https://github.com/orbiting/republik-frontend) and [publikator-frontend](https://github.com/orbiting/publikator-frontend).

Beyond that it provides some definitions to our [backends](https://github.com/orbiting/backends) and [app](https://github.com/orbiting/app), was used in various prototypes and the charts are available on [observablehq.com](https://observablehq.com/@republik/charts) for story prototyping.

## License

The logo and fonts are the property of their owners (logo—Project R, GT America—GrilliType and Rubis—Nootype), and may not be reproduced without permission.

The source code is «BSD 3-clause» licensed.

## Use it in your React app

The peer dependencies are: `react`, `prop-types` and `glamor`.

```
npm install @project-r/styleguide --save
```

Example [button](/components/button):

```code|lang-js
import {Button} from '@project-r/styleguide'

const Crowdfunding = () => (
  <section>
    <p>«Es ist Zeit, dass sich die Journalisten unabhängig machen und der Journalismus unabhängig von den Grossverlagen existieren kann. Und ein Modell dafür schafft man nur gemeinsam, oder gar nicht.»</p>
    <Button>Mitmachen</Button>
  </section>
)
```

See components in the menu for a full list and documentation.

### Usage with Next.js

`glamor` needs to be integrated into server rendering. For a simple integration use the following `pages/_document.js`:

```code|lang-js
import Document, {Head, Main, NextScript} from 'next/document'
import {renderStatic} from 'glamor/server'

export default class MyDocument extends Document {
  static async getInitialProps ({renderPage}) {
    const page = renderPage()
    const styles = renderStatic(() => page.html)
    return { ...page, ...styles }
  }
  render () {
    const {css} = this.props
    return (
      <html>
        <Head>
          <meta name='viewport' content='width=device-width,initial-scale=1' />
          <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
          {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
```

See also:

- [next.js Example](https://github.com/zeit/next.js/blob/master/examples/with-glamor/pages/_document.js)
- [Webfonts Integration](/typographie)
