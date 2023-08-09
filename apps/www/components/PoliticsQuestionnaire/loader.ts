import fs from 'node:fs/promises'
import path from 'node:path'

export async function loadPoliticQuestionnaireCSV() {
  const csvPath = path.join(
    process.cwd(),
    '/public/static/politicsquestionnaire2023/submissions_data.csv',
  )
  return fs.readFile(csvPath, 'utf-8')
}
