/**
 * NOTE: these are only used directly by the mail module.
 *
 * The font definitions are outdated compared to the ones used in the apps and styleguide (i.e. the font names should not differ for each weight/style).
 * Ideally, these would be the same but I don't know how often these font family names are relied upon in emails.
 *  */

module.exports = {
  FONT_FACES:
    '@font-face{font-family:"Rubis-Regular";src:url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-regular.eot);src:url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-regular.eot?#iefix) format("embedded-opentype"),url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-regular.woff2) format("woff2"),url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-regular.woff) format("woff"),url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-regular.ttf) format("truetype")}@font-face{font-family:"Rubis-Regular-Italic";font-style:italic;src:url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-regularitalic.eot);src:url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-regularitalic.eot?#iefix) format("embedded-opentype"),url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-regularitalic.woff2) format("woff2"),url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-regularitalic.woff) format("woff"),url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-regularitalic.ttf) format("truetype")}@font-face{font-family:"Rubis-Bold";font-weight:700;src:url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-bold.eot);src:url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-bold.eot?#iefix) format("embedded-opentype"),url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-bold.woff2) format("woff2"),url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-bold.woff) format("woff"),url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-bold.ttf) format("truetype")}@font-face{font-family:"Rubis-Bold-Italic";font-weight:700;font-style:italic;src:url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-bolditalic.eot);src:url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-bolditalic.eot?#iefix) format("embedded-opentype"),url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-bolditalic.woff2) format("woff2"),url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-bolditalic.woff) format("woff"),url(https://cdn.repub.ch/s3/republik-assets/fonts/rubis-bolditalic.ttf) format("truetype")}@font-face{font-family:"GT-America-Standard-Regular";src:url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-regular.eot);src:url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-regular.eot?#iefix) format("embedded-opentype"),url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-regular.woff) format("woff"),url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-regular.ttf) format("truetype")}@font-face{font-family:"GT-America-Standard-Regular-Italic";font-style:italic;src:url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-regular-italic.eot);src:url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-regular-italic.eot?#iefix) format("embedded-opentype"),url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-regular-italic.woff2) format("woff2"),url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-regular-italic.woff) format("woff"),url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-regular-italic.ttf) format("truetype")}@font-face{font-family:"GT-America-Standard-Medium";font-weight:500;src:url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-medium.eot);src:url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-medium.eot?#iefix) format("embedded-opentype"),url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-medium.woff) format("woff"),url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-medium.ttf) format("truetype")}@font-face{font-family:"GT-America-Standard-Bold";font-weight:700;src:url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-bold.woff2) format("woff2"),url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-bold.woff) format("woff"),url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-bold.ttf) format("truetype")}@font-face{font-family:"RepublikSerif-Black";font-weight:900;src:url(https://cdn.repub.ch/s3/republik-assets/fonts/republik-serif-black-1013b.eot);src:url(https://cdn.repub.ch/s3/republik-assets/fonts/republik-serif-black-1013b.eot?#iefix) format("embedded-opentype"),url(https://cdn.repub.ch/s3/republik-assets/fonts/republik-serif-black-1013b.woff2) format("woff2"),url(https://cdn.repub.ch/s3/republik-assets/fonts/republik-serif-black-1013b.woff) format("woff"),url(https://cdn.repub.ch/s3/republik-assets/fonts/republik-serif-black-1013b.ttf) format("truetype")}@font-face{font-family:"Inicia-Medium-Italic";font-weight:500;font-style:italic;src:url(https://cdn.repub.ch/s3/republik-assets/fonts/inicia-medium-italic.eot);src:url(https://cdn.repub.ch/s3/republik-assets/fonts/inicia-medium-italic.eot?#iefix) format("embedded-opentype"),url(https://cdn.repub.ch/s3/republik-assets/fonts/inicia-medium-italic.woff) format("woff"),url(https://cdn.repub.ch/s3/republik-assets/fonts/inicia-medium-italic.ttf) format("truetype")}@font-face{font-family:"Druk-Wide";font-weight:500;font-style:normal;src:url(https://cdn.repub.ch/s3/republik-assets/fonts/druk-wide-medium.woff2) format("woff2"),url(https://cdn.repub.ch/s3/republik-assets/fonts/druk-wide-medium.woff) format("woff")}',
  FONT_FAMILIES: {
    serifTitle: 'RepublikSerif-Black, Rubis-Bold, serif',
    serifRegular: 'Rubis-Regular, Georgia-Regular, Droid-Serif-Regular, serif',
    serifItalic:
      'Rubis-Regular-Italic, Georgia-Italic, Droid-Serif-Italic, serif',
    serifBold: 'Rubis-Bold, Georgia-Bold, Droid-Serif-Bold, serif',
    sansSerifRegular:
      'GT-America-Standard-Regular, Helvetica-Neue-Regular, Arial-Regular, Roboto-Regular, sans-serif',
    sansSerifItalic:
      'GT-America-Standard-Regular-Italic, Helvetica-Neue-Italic, Arial-Italic, Roboto-Italic, sans-serif',
    sansSerifMedium:
      'GT-America-Standard-Medium, Helvetica-Neue-Medium, Arial-Bold, Roboto-Medium, sans-serif',
    cursiveTitle:
      'Inicia-Medium-Italic, Helvetica-Neue-Italic, Arial-Italic, Roboto-Italic, sans-serif',
  },
  FONT_STYLES: {
    serifTitle: {
      fontFamily: 'RepublikSerif-Black, Rubis-Bold, Georgia, serif',
      fontWeight: 900,
      fontStyle: 'normal',
    },
    serifRegular: {
      fontFamily: 'Rubis-Regular, Georgia, serif',
      fontWeight: 400,
      fontStyle: 'normal',
    },
    serifItalic: {
      fontFamily: 'Rubis-Regular-Italic, Georgia, serif',
      fontWeight: 400,
      fontStyle: 'italic',
    },
    serifBold: {
      fontFamily: 'Rubis-Bold, Georgia, serif',
      fontWeight: 700,
      fontStyle: 'normal',
    },
    serifBoldItalic: {
      fontFamily: 'Rubis-Bold-Italic, Georgia, serif',
      fontWeight: 700,
      fontStyle: 'italic',
    },
    sansSerifRegular: {
      fontFamily:
        'GT-America-Standard-Regular, Helvetica Neue, Helvetica, sans-serif',
      fontWeight: 400,
      fontStyle: 'normal',
    },
    sansSerifItalic: {
      fontFamily:
        'GT-America-Standard-Regular-Italic, Helvetica Neue, Helvetica, sans-serif',
      fontWeight: 400,
      fontStyle: 'italic',
    },
    sansSerifMedium: {
      fontFamily:
        'GT-America-Standard-Medium, Helvetica Neue, Helvetica, sans-serif',
      fontWeight: 500,
      fontStyle: 'normal',
    },
    sansSerifBold: {
      fontFamily:
        'GT-America-Standard-Bold, Helvetica Neue, Helvetica, sans-serif',
      fontWeight: 700,
      fontStyle: 'normal',
    },
    monospaceRegular: {
      fontFamily: 'Menlo, Courier, monospace',
      fontWeight: 400,
      fontStyle: 'normal',
    },
    cursiveTitle: {
      fontFamily: 'Inicia-Medium-Italic, Roboto, sans-serif',
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
