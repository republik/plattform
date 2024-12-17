import { QuestionnaireConfig } from '../types/QuestionnaireConfig'

// TODO: this could also live in the dynamic componnent config
//  (although it feels easier/cleaner in the editor, since our
//  questionnaires require a bit of handiwork anyway)
const democracyConfig: QuestionnaireConfig = {
  dbSlug: 'klima-fragebogen-v2',
  questionsStruct: [
    { ids: [0] },
    { ids: [1], valueLength: { min: 5, max: 200 } },
    { ids: [2], valueLength: { min: 5, max: 150 } },
    { ids: [3], valueLength: { min: 5, max: 50 } },
    { ids: [4], valueLength: { min: 50, max: 150 } },
    { ids: [5], valueLength: { min: 80, max: 200 } },
    { ids: [6], valueLength: { min: 5, max: 100 } },
    { ids: [7], valueLength: { min: 5, max: 200 } },
    { ids: [8], valueLength: { min: 5, max: 50 } },
  ],
  paths: {
    overviewPage: '/2023/11/07/so-blicken-sie-auf-die-klimakrise',
    personPage: 'fragebogen-klimakrise',
    formPage: '/2023/11/07/wie-blicken-sie-zurzeit-auf-die-klimakrise'
  },
  overviewPage: {
    shareText: 'Stöbern Sie durch die Antworten der Republik-Leserinnen, und fügen Sie Ihre eigene Antwort hinzu.'
  },
  personPage: {
    title: 'Wie blicken Sie zurzeit auf die Klimakrise? Die Antworten von {name}',
    metaTitle: 'Wie blicken Sie zurzeit auf die Klimakrise?',
    metaDescription: 'Das sind die Antworten von {name}. Was sind Ihre?',
    shareText: 'Wie blicken Sie zurzeit auf die Klimakrise? Die Antworten von '
  },
  design: {
    bgColor: '#EBEA2B',
    colors: ['#EBEA2B', '#E595D9', '#5AC5E1', '#FF9273', '#6CC485'],
    img: {
      url: 'https://cdn.repub.ch/s3/republik-assets/repos/republik/page-klimafragebogen-uebersicht/files/034a0eca-8aaf-4511-90aa-504cca584981/final-art_questionnaire.png',
      urlSquare: 'https://cdn.repub.ch/s3/republik-assets/repos/republik/article-klimafragebogen-version-2-uebersichtsseite/images/df9fec323575229d1578831affe5c79c02275cd3.png?resize=800x',
      credit: 'Cristina Spanò'
    }
  }
}

export default democracyConfig


