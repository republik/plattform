/**
 * NOTE: these are only used directly by the mail module.
 *
 * The font definitions are outdated compared to the ones used in the apps and styleguide (i.e. the font names should not differ for each weight/style).
 * Ideally, these would be the same but I don't know how often these font family names are relied upon in emails.
 *  */

module.exports = {
  FONT_FACES: `@font-face {
  font-family: 'Rubis';
  src: url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis.eot);
  src: url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis.eot?#iefix)
      format('embedded-opentype'),
    url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis.woff2)
      format('woff2'),
    url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis.woff)
      format('woff'),
    url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis.ttf)
      format('truetype');
}
@font-face {
  font-family: 'Rubis';
  font-style: italic;
  src: url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis.eot);
  src: url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis.eot?#iefix)
      format('embedded-opentype'),
    url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis.woff2)
      format('woff2'),
    url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis.woff)
      format('woff'),
    url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis.ttf)
      format('truetype');
}
@font-face {
  font-family: 'Rubis';
  font-weight: 700;
  src: url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis.eot);
  src: url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis.eot?#iefix)
      format('embedded-opentype'),
    url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis.woff2)
      format('woff2'),
    url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis.woff)
      format('woff'),
    url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis.ttf)
      format('truetype');
}
@font-face {
  font-family: 'Rubis';
  font-weight: 700;
  font-style: italic;
  src: url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis.eot);
  src: url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis.eot?#iefix)
      format('embedded-opentype'),
    url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis.woff2)
      format('woff2'),
    url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis.woff)
      format('woff'),
    url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis.ttf)
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
}`,
  FONT_STYLES: {
    serifTitle: {
      fontFamily: 'RepublikSerif, Rubis, Georgia, serif',
      fontWeight: 900,
      fontStyle: 'normal',
    },
    serifRegular: {
      fontFamily: 'Rubis, Georgia, serif',
      fontWeight: 400,
      fontStyle: 'normal',
    },
    serifItalic: {
      fontFamily: 'Rubis, Georgia, serif',
      fontWeight: 400,
      fontStyle: 'italic',
    },
    serifBold: {
      fontFamily: 'Rubis, Georgia, serif',
      fontWeight: 700,
      fontStyle: 'normal',
    },
    serifBoldItalic: {
      fontFamily: 'Rubis, Georgia, serif',
      fontWeight: 700,
      fontStyle: 'italic',
    },
    sansSerifRegular: {
      fontFamily: 'GT-America-Standard, Helvetica Neue, Helvetica, sans-serif',
      fontWeight: 400,
      fontStyle: 'normal',
    },
    sansSerifItalic: {
      fontFamily: 'GT-America-Standard, Helvetica Neue, Helvetica, sans-serif',
      fontWeight: 400,
      fontStyle: 'italic',
    },
    sansSerifMedium: {
      fontFamily: 'GT-America-Standard, Helvetica Neue, Helvetica, sans-serif',
      fontWeight: 500,
      fontStyle: 'normal',
    },
    sansSerifBold: {
      fontFamily: 'GT-America-Standard, Helvetica Neue, Helvetica, sans-serif',
      fontWeight: 700,
      fontStyle: 'normal',
    },
    monospaceRegular: {
      fontFamily: 'Menlo, Courier, monospace',
      fontWeight: 400,
      fontStyle: 'normal',
    },
    cursiveTitle: {
      fontFamily: 'Inicia, Roboto, sans-serif',
      fontWeight: 500,
      fontStyle: 'italic',
    },
    flyerTitle: {
      fontFamily: 'Druk-Wide, Roboto, sans-serif',
      fontWeight: 500,
      fontStyle: 'normal',
    },
  },
}
