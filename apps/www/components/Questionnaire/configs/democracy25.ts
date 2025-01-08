import { QuestionnaireConfig } from '../types/QuestionnaireConfig'

// TODO: this could also live in the dynamic componnent config
//  (although it feels easier/cleaner in the editor, since our
//  questionnaires require a bit of handiwork anyway)
const democracyConfig: QuestionnaireConfig = {
  dbSlug: 'democracy-25',
  questionsStruct: [
    { ids: [0, 1] },
    { ids: [3] },
    { ids: [4] },
    { ids: [5] },
    { ids: [6,7], valueLength: { min: 5 }, hint: 'Tippen Sie eine Antwort an, um den ganzen Fragebogen dieser Person zu sehen.', },
    { ids: [8,9], valueLength: { min: 5 } },
    { ids: [10] },
    { ids: [11] },
    { ids: [12], valueLength: { min: 5 } },
    { ids: [13] },
    { ids: [14, 15], valueLength: { min: 5 } },
    { ids: [16] },
    { ids: [17] },
    { ids: [18] },
    { ids: [19] },
    { ids: [20] },
    { ids: [21], valueLength: { min: 5 } },
    { ids: [22], valueLength: { min: 5 } }
  ],
  paths: {
    overviewPage: '/2025/01/07/22-fragen-zur-demokratie-ihr-votum',
    formPage: '/2025/01/06/stellen-sie-sich-vor-22-fragen-zur-demokratie'
  },
  personPage: {
    title: 'Euer Votum über Demokratie'
  },
  design: {
    bgColor: '#feeafa',
    colors: ['#feeafa', '#dee2ff'],
    img: {
      url: 'https://cdn.repub.ch/s3/republik-assets/repos/republik/page-klimafragebogen-uebersicht/files/034a0eca-8aaf-4511-90aa-504cca584981/final-art_questionnaire.png',
      urlSquare: 'https://cdn.repub.ch/s3/republik-assets/repos/republik/article-klimafragebogen-version-2-uebersichtsseite/images/df9fec323575229d1578831affe5c79c02275cd3.png?resize=800x',
      credit: 'Cristina Spanò'
    }
  }
}

export default democracyConfig


