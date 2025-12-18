import { cssFor } from 'glamor'
import { Mso } from '@republik/mdast-react-render/email'
import Header from './Header'
import {
  editorialFontRule,
  interactionFontRule,
} from '../../styleguide-clone/components/Typography'
import { VariableContext } from '../../styleguide-clone/components/Variables'
import Footer from './Footer'

const Container = ({ children, meta, variableContext }) => {
  return (
    <html>
      <head>
        <meta charSet='UTF-8' />
        <meta httpEquiv='x-ua-compatible' content='IE=edge' />
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <Mso gte='15'>
          {`
        <xml>
          <o:officedocumentsettings>
            <o:allowpng />
            <o:pixelsperinch>96</o:pixelsperinch>
          </o:officedocumentsettings>
        </xml>
        `}
        </Mso>
        <title>*|MC:SUBJECT|*</title>
        <style
          type='text/css'
          dangerouslySetInnerHTML={{
            __html: `
        @font-face {
          font-family: 'Rubis';
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-regular.eot);
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-regular.eot?#iefix)
              format('embedded-opentype'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-regular.woff2)
              format('woff2'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-regular.woff)
              format('woff'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-regular.ttf)
              format('truetype');
        }
        @font-face {
          font-family: 'Rubis';
          font-style: italic;
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-regularitalic.eot);
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-regularitalic.eot?#iefix)
              format('embedded-opentype'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-regularitalic.woff2)
              format('woff2'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-regularitalic.woff)
              format('woff'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-regularitalic.ttf)
              format('truetype');
        }
        @font-face {
          font-family: 'Rubis';
          font-weight: 700;
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-bold.eot);
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-bold.eot?#iefix)
              format('embedded-opentype'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-bold.woff2)
              format('woff2'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-bold.woff)
              format('woff'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-bold.ttf)
              format('truetype');
        }
        @font-face {
          font-family: 'Rubis';
          font-weight: 700;
          font-style: italic;
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-bolditalic.eot);
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-bolditalic.eot?#iefix)
              format('embedded-opentype'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-bolditalic.woff2)
              format('woff2'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-bolditalic.woff)
              format('woff'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-bolditalic.ttf)
              format('truetype');
        }
        @font-face {
          font-family: 'Rubis';
          font-weight: 500;
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-medium.eot);
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-medium.eot?#iefix)
              format('embedded-opentype'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-medium.woff2)
              format('woff2'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-medium.woff)
              format('woff'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-medium.ttf)
              format('truetype');
        }
        @font-face {
          font-family: 'Rubis';
          font-weight: 500;
          font-style: italic;
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-mediumitalic.eot);
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-mediumitalic.eot?#iefix)
              format('embedded-opentype'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-mediumitalic.woff2)
              format('woff2'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-mediumitalic.woff)
              format('woff'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-mediumitalic.ttf)
              format('truetype');
        }
        @font-face {
          font-family: 'GT-America-Standard';
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-regular.eot);
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-regular.eot?#iefix)
              format('embedded-opentype'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-regular.woff)
              format('woff'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-regular.ttf)
              format('truetype');
        }
        @font-face {
          font-family: 'GT-America-Standard';
          font-style: italic;
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-regular-italic.eot);
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-regular-italic.eot?#iefix)
              format('embedded-opentype'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-regular-italic.woff2)
              format('woff2'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-regular-italic.woff)
              format('woff'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-regular-italic.ttf)
              format('truetype');
        }
        @font-face {
          font-family: 'GT-America-Standard';
          font-weight: 500;
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-medium.eot);
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-medium.eot?#iefix)
              format('embedded-opentype'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-medium.woff)
              format('woff'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-medium.ttf)
              format('truetype');
        }
        @font-face {
          font-family: 'GT-America-Standard';
          font-weight: 700;
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-bold.woff2)
              format('woff2'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-bold.woff)
              format('woff'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-bold.ttf)
              format('truetype');
        }
        @font-face {
          font-family: 'RepublikSerif';
          font-weight: 900;
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/republik-serif-black-1013b.eot);
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/republik-serif-black-1013b.eot?#iefix)
              format('embedded-opentype'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/republik-serif-black-1013b.woff2)
              format('woff2'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/republik-serif-black-1013b.woff)
              format('woff'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/republik-serif-black-1013b.ttf)
              format('truetype');
        }
        @font-face {
          font-family: 'Inicia';
          font-weight: 500;
          font-style: italic;
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/inicia-medium-italic.eot);
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/inicia-medium-italic.eot?#iefix)
              format('embedded-opentype'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/inicia-medium-italic.woff)
              format('woff'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/inicia-medium-italic.ttf)
              format('truetype');
        }
        @font-face {
          font-family: 'Druk-Wide';
          font-weight: 500;
          font-style: normal;
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/druk-wide-medium.woff2)
              format('woff2'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/druk-wide-medium.woff)
              format('woff');
        }
        @font-face {
          font-family: 'Druk';
          font-weight: 500;
          font-style: normal;
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/Druk-Medium-Web.woff2)
              format('woff2'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/Druk-Medium-Web.woff)
              format('woff');
        }
        @font-face {
          font-family: 'Druk';
          font-weight: 500;
          font-style: italic;
          src: url(https://cdn.repub.ch/s3/republik-assets/fonts/Druk-MediumItalic-Web.woff2)
              format('woff2'),
            url(https://cdn.repub.ch/s3/republik-assets/fonts/Druk-MediumItalic-Web.woff)
              format('woff');
        }
        ${cssFor(editorialFontRule)}
        ${cssFor(interactionFontRule)}
      `,
          }}
        />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#fff' }}>
        <table border='0' cellPadding='0' cellSpacing='0' width='100%'>
          <tbody>
            <VariableContext.Provider value={variableContext}>
              <Header meta={meta} />
              {children}
              <Footer meta={meta} />
            </VariableContext.Provider>
          </tbody>
        </table>
      </body>
    </html>
  )
}

export default Container
