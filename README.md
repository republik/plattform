# R Styleguide

This styleguide is build with [Catalog](https://interactivethings.github.io/catalog/). You can write documention in Markdown and React.

## Develop

You will need [Node.js 6.9](https://nodejs.org/en/download/current/) or higher.

To start the development server run:

```
npm install
npm start
```

## Deploy

Everything pushed on master is automatically deployed to:
[styleguide.project-r.construction](https://styleguide.project-r.construction/)

## Use it in your React app

The peer dependencies are: `react` and `glamor`

```
npm install @project-r/styleguide --save
```

Then use it in your app:

```
import {Button} from '@project-r/styleguide'


const Crowdfunding = () => (
  <section>
    <p>«Es ist Zeit, dass sich die Journalisten unabhängig machen und der Journalismus unabhängig von den Grossverlagen existieren kann. Und ein Modell dafür schafft man nur gemeinsam, oder gar nicht.»</p>
    <Button>Mitmachen</Button>
  </section>
)
```

### Usage with Next.js

Make sure to include the CSS when server rendering with following `pages/_document.js`:

```
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
