import { SUBMISSIONS_DATA_URL } from './config'

export async function loadPoliticQuestionnaireCSV() {
  return fetch(SUBMISSIONS_DATA_URL).then((res) => res.text())
}
