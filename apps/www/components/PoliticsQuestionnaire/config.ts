import { scaleOrdinal } from 'd3-scale'

// TODO: use correct color palette
export const QUESTIONNAIRE_BG_COLOR = '#bde6dc'
// const COLORS = ['#56a9df', '#66b7ed']

const COLORS = [
  '#bde6dc',
  '#a89bd1',
  '#c76c65',
  '#f9d97a',
  '#ffd2e2',
  '#f1abff',
]

export const QUESTION_SEPARATOR = ','

export const questionColor = scaleOrdinal([0, 1, 2, 3, 4, 5], COLORS)

type QuestionConfigOrder = {
  questionSlugs: string[]
}

type QuestionConfigType = {
  questionSlug: string
  type: string
  options?: string[]
  answerLength?: {
    min?: number
    max?: number
  }
}

export const QUESTIONS: QuestionConfigOrder[] = [
  {
    questionSlugs: ['1-ihre-politische-haltung-in-einem-satz'],
  },
  { questionSlugs: ['2-was-ist-fur-sie-politisch-nicht-verhandelbar'] },
  {
    questionSlugs: ['3-wo-haben-sie-sich-politisch-grundlegend-geirrt'],
  },
  { questionSlugs: ['4-was-bringt-sie-politisch-zur-weissglut'] },
  {
    questionSlugs: [
      '5-welche-ihrer-politischen-gegnerinnen-sind-ihnen-am-sympathischsten-und-warum',
    ],
  },
  {
    questionSlugs: ['6-stimmt-die-steigerung-feind-todfeind-parteifreund'],
  },
  {
    questionSlugs: ['7-wahlen-sie-die-gleiche-partei-wie-ihre-eltern'],
  },
  {
    questionSlugs: ['8-wie-viel-darf-man-in-der-politik-lugen'],
  },
  {
    questionSlugs: ['9-was-sollte-einmal-in-ihrem-nachruf-stehen'],
  },
  {
    questionSlugs: [
      '10-wie-oft-gibt-es-im-parlament-intrigen',
      '11-ein-beispiel',
    ],
  },
  {
    questionSlugs: ['12-ist-es-ein-vorteil-als-politiker-gut-auszusehen'],
  },
  {
    questionSlugs: ['13-braucht-man-als-politikerin-humor'],
  },
  {
    questionSlugs: ['14-welches-ist-ihr-liebster-politikerinnen-witz'],
  },
  {
    questionSlugs: [
      '15-wenn-sie-als-politiker-ein-tier-sein-mussten-welches-waren-sie',
    ],
  },
  {
    questionSlugs: ['16-wo-verbringen-sie-ihre-sommerferien'],
  },
  {
    questionSlugs: ['17-wo-werden-sie-ihre-sommerferien-sicher-nie-verbringen'],
  },
  {
    questionSlugs: [
      '18-wie-viele-wochen-ferien-pro-jahr-haben-sie',
      '19-und-wie-viele-brauchten-sie',
    ],
  },
  {
    questionSlugs: [
      '20-an-welche-destination-darf-man-mit-dem-flugzeug-in-die-ferien',
    ],
  },
  {
    questionSlugs: ['21-ihre-ferienlekture'],
  },
  {
    questionSlugs: [
      '22-welche-app-auf-ihrem-handy-offnen-sie-in-ihren-ferien-am-haufigsten',
    ],
  },
  {
    questionSlugs: ['23-ihr-verhaltnis-zu-sand'],
  },
  {
    questionSlugs: ['24-ihr-verhaltnis-zu-sonnencreme'],
  },
  {
    questionSlugs: ['25-es-ist-ein-tag-vor-ferienende-ihre-stimmung'],
  },
]

export const QUESTION_TYPES: QuestionConfigType[] = [
  {
    questionSlug: '1-ihre-politische-haltung-in-einem-satz',
    type: 'text',
    answerLength: { min: 0, max: 50 },
  },
  {
    questionSlug: '2-was-ist-fur-sie-politisch-nicht-verhandelbar',
    type: 'text',
    answerLength: { min: 0, max: 250 },
  },
  {
    questionSlug: '3-wo-haben-sie-sich-politisch-grundlegend-geirrt',
    type: 'text',
    answerLength: { min: 0, max: 250 },
  },
  {
    questionSlug: '4-was-bringt-sie-politisch-zur-weissglut',
    type: 'text',
    answerLength: { min: 0, max: 250 },
  },
  {
    questionSlug:
      '5-welche-ihrer-politischen-gegnerinnen-sind-ihnen-am-sympathischsten-und-warum',
    type: 'text',
    answerLength: { min: 0, max: 250 },
  },
  {
    questionSlug: '6-stimmt-die-steigerung-feind-todfeind-parteifreund',
    type: 'choice',
    options: [
      'Sie ist zumindest nicht ganz falsch.',
      'Natürlich nicht. Meine Partei ist meine Heimat.',
      'Uff ...',
    ],
  },
  {
    questionSlug: '7-wahlen-sie-die-gleiche-partei-wie-ihre-eltern',
    type: 'choice',
    options: ['Ja', 'Nein', 'Immer öfter'],
  },
  {
    questionSlug: '8-wie-viel-darf-man-in-der-politik-lugen',
    type: 'choice',
    options: [
      'Wenn es der Sache dient.',
      'Ehrlich wählt am längsten.',
      'Da frage ich zurück: Wie viel darf man im Journalismus lügen?',
    ],
  },
  {
    questionSlug: '9-was-sollte-einmal-in-ihrem-nachruf-stehen',
    type: 'text',
    answerLength: { min: 0, max: 250 },
  },
  {
    questionSlug: '10-wie-oft-gibt-es-im-parlament-intrigen',
    type: 'choice',
    options: ['Täglich', 'Kaum je', 'Uff ...'],
  },
  {
    questionSlug: '11-ein-beispiel',
    type: 'text',
    answerLength: { min: 0, max: 250 },
  },
  {
    questionSlug: '12-ist-es-ein-vorteil-als-politiker-gut-auszusehen',
    type: 'text',
    answerLength: { min: 0, max: 250 },
  },
  {
    questionSlug: '13-braucht-man-als-politikerin-humor',
    type: 'text',
    answerLength: { min: 0, max: 250 },
  },
  {
    questionSlug: '14-welches-ist-ihr-liebster-politikerinnen-witz',
    type: 'text',
    answerLength: { min: 0, max: 250 },
  },
  {
    questionSlug:
      '15-wenn-sie-als-politiker-ein-tier-sein-mussten-welches-waren-sie',
    type: 'choice',
    options: ['Elefant', 'Fuchs', 'Panda', 'Gepard', 'Katze', 'Chamäleon'],
  },
  {
    questionSlug: '16-wo-verbringen-sie-ihre-sommerferien',
    type: 'text',
    answerLength: { min: 0, max: 250 },
  },
  {
    questionSlug: '17-wo-werden-sie-ihre-sommerferien-sicher-nie-verbringen',
    type: 'text',
    answerLength: { min: 0, max: 250 },
  },
  {
    questionSlug: '18-wie-viele-wochen-ferien-pro-jahr-haben-sie',
    type: 'text',
    answerLength: { min: 0, max: 250 },
  },
  {
    questionSlug: '19-und-wie-viele-brauchten-sie',
    type: 'text',
    answerLength: { min: 0, max: 250 },
  },
  {
    questionSlug:
      '20-an-welche-destination-darf-man-mit-dem-flugzeug-in-die-ferien',
    type: 'choice',
    options: ['Südfrankreich', 'Zypern', 'Malediven', 'Gar nicht'],
  },
  {
    questionSlug: '21-ihre-ferienlekture',
    type: 'text',
    answerLength: { min: 0, max: 250 },
  },
  {
    questionSlug:
      '22-welche-app-auf-ihrem-handy-offnen-sie-in-ihren-ferien-am-haufigsten',
    type: 'text',
    answerLength: { min: 0, max: 250 },
  },
  {
    questionSlug: '23-ihr-verhaltnis-zu-sand',
    type: 'choice',
    options: ['Innig', 'Es ist die Hölle.', 'Indifferent'],
  },
  {
    questionSlug: '24-ihr-verhaltnis-zu-sonnencreme',
    type: 'choice',
    options: ['Muss', 'Zerrüttet'],
  },
  {
    questionSlug: '25-es-ist-ein-tag-vor-ferienende-ihre-stimmung',
    type: 'text',
    answerLength: { min: 0, max: 250 },
  },
]

export const OVERVIEW_QUESTIONNAIRE_PATH = '/politikfragebogen/overview'

export const QUESTIONNAIRE_SLUG = 'politiker-fragebogen-community'

export const QUESTIONNAIRE_SQUARE_IMG_URL =
  'https://cdn.repub.ch/s3/republik-assets/repos/republik/article-community-fragebogen-politik-sommer-2023/files/36c07305-f4e0-4bdc-91a2-287c087fe89e/politiker.png'

export const ILLU_SHARE =
  'https://cdn.repub.ch/s3/republik-assets/repos/republik/page-politikfragebogen-community-uebersicht/files/ce8c3928-8dbd-49ec-a087-5adac8f99efa/politiker_share.png'

export const ILLU_CREDIT = 'Nadine Redlich'

export const PERSON_SHARE_TEXT =
  '25 Fragen vor der Wahl im Herbst – die Antworten von '
