import { URL } from 'url'
import { SUBMISSIONS_DATA_URL } from './config'

export async function loadPoliticQuestionnaireCSV() {
  return fetch(new URL(SUBMISSIONS_DATA_URL)).then((res) => {
    console.warn(res)
    return res.text()
  })
}
