import { SUBMISSIONS_DATA_URL } from './config'

export async function loadPoliticQuestionnaireCSV() {
  return fetch(new URL(SUBMISSIONS_DATA_URL)).then((res) => {
    return res.text()
  })
}
