import axios from 'axios'
import { SUBMISSIONS_DATA_URL } from './config'

export async function loadPoliticQuestionnaireCSV() {
  const res = await axios.get(SUBMISSIONS_DATA_URL)
  return res.data
}
