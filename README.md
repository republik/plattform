# Republik Styleguide

Das Erscheinungsbild der Republik ist nicht abgeschlossen sondern wird ständig erweitert und weiterentwickelt.

Der Styleguide dokumentiert den aktuellen Stand und stellt diesen als React-Komponenten, publiziert als NPM-Paket, zur Verfügung.

## Benutzen

Voraussetzung zur Nutzung sind die Pakete: `react` und `glamor`.

```
npm install @project-r/styleguide --save
```

Beispiel [Button](/components/button):

```
import {Button} from '@project-r/styleguide'

const Crowdfunding = () => (
  <section>
    <p>«Es ist Zeit, dass sich die Journalisten unabhängig machen und der Journalismus unabhängig von den Grossverlagen existieren kann. Und ein Modell dafür schafft man nur gemeinsam, oder gar nicht.»</p>
    <Button>Mitmachen</Button>
  </section>
)
```

Siehe Menüpunkt «Komponenten» für die volle Liste und Dokumentation.

### Mit Next.js

`glamor` benötigt eine Intergation in den Server-Rendering-Prozess. Eine einfache Integration in `pages/_document.js`:

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

Siehe auch:
- [next.js Beispiel](https://github.com/zeit/next.js/blob/master/examples/with-glamor/pages/_document.js)
- [Webfonts Integration](/typographie)

## Weiterentwickeln

Der Styleguide ist gebaut mit [Catalog](https://interactivethings.github.io/catalog/). Die Dokumentation wird mit Markdown und React geschrieben.

Zur Entwicklung wird [Node.js 6.9](https://nodejs.org/en/download/current/) oder neuer benötigt.

Lokalen Entwicklungsserver starten:

```
npm install
npm run dev
```

