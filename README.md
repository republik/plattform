This is a living style guide. Subject to constant change.

It documents the current state and provides implemented React components, published as an npm package.

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

### Theming

We want to keep the style guide code simple and will keep the theming options to a minimum. Fork if you want to customize more.

Following environment variables are available for theming:

```
SG_COLORS={"primary":"Maroon"}
SG_FONT_FAMILIES={"serifRegular":"'Droid Serif', serif"}
SG_FONT_FACES=@import url('https://fonts.googleapis.com/css?family=Droid+Serif')
SG_LOGO_PATH=M0 0 L4 0 L4 1.5 L3 0.5 L2 4 L1 0.5 L0 1.5 Z
SG_LOGO_VIEWBOX=0 0 4 1.5
SG_BRAND_MARK_PATH=M0 4 L1 0 L4 4 Z
SG_BRAND_MARK_VIEWBOX=0 0 4 4
```

They may be prefixed with `REACT_APP_` for [CRA compatibility](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#adding-custom-environment-variables). And will be retrieved from `window.ENV`, `window.__NEXT_DATA__.env` or  `process.env`.

## Develop

This style guide is build with [Catalog](https://interactivethings.github.io/catalog/). You can write documentation in Markdown and React.

You will need [Node.js 6.9](https://nodejs.org/en/download/current/) or higher.

To start the development server run:

```
npm install
npm run dev
```

Further reading:
- [Adding a New Component](/dev/process)

### Semantic Release

The `master` branch gets auto-released via Travis. The next version is automatically determined according to the past [commit messages](https://github.com/semantic-release/semantic-release#default-commit-message-format).

#### Commit Message Format

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

You can use `npm run commit` to generate a message via an interactive prompt.

**Types**

Always changelog relevant: `feat`, `fix`, `perf`
Others: `docs`, `chore`, `style`, `refactor`, `test`

Scope is optional.

> The body should include the motivation for the change and contrast this with previous behavior.

> The footer should contain any information about Breaking Changes and is also the place to reference GitHub issues that this commit Closes.

##### Quick Examples

**Patch Release**

```
fix(field): focus issue in IE

Closes #28
```

**Feature Release**

```
feat(field): add auto focus option
```

**Breaking Release**

```
refactor(field): remove label support

BREAKING CHANGE: We no longer support field labels only placeholders!
```
