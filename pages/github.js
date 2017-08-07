import withData from '../lib/apollo/withData'
import { Link } from '../server/routes'

import App from '../lib/App'
import Repositories from '../lib/github/components/Repository/List'
import Branches from '../lib/github/components/Branch/List'
import Tree from '../lib/github/components/Tree/List'
import Commits from '../lib/github/components/Commit/List'
import Editor from '../lib/github/components/Editor'
import FileCommits from '../lib/github/components/FileCommits/'
import Checklist from '../lib/components/Checklist'
import ProcessToolbar from '../lib/components/ProcessToolbar'

const logins = [
  'orbiting',
  'clarajeanne',
  'tpreusse',
  'uxengine',
  'lukasbuenger',
  'patte'
]

export default withData(({ url: { query } }) => {
  const { login, repository, view, path } = query
  return (
    <App>
      {!login &&
        <div>
          <h2>Welcome</h2>
          <small>Please choose a github login:</small>
          <ul>
            {logins.map(login =>
              <li key={login}>
                <Link route='github' params={{ login }}>
                  <a>
                    {login}
                  </a>
                </Link>
              </li>
            )}
          </ul>
        </div>}
      {login &&
        !repository &&
        <div>
          <h2>
            {login}/
          </h2>
          <small>Repositories:</small>
          <Repositories {...query} />
        </div>}
      {repository &&
        !path &&
        <div>
          <h2>
            {login}/{repository}
          </h2>
          <small>Branches:</small>
          <Branches {...query} />
        </div>}
      {path &&
        view === 'tree' &&
        <div>
          <h2>
            {login}/{repository}/{view}/{path}
          </h2>
          <small>Tree:</small>
          <Tree {...query} />
          <div>
            <br />
            <Link
              route='github'
              params={{
                login,
                repository,
                view: 'commits',
                path: path.split('/')[0]
              }}
            >
              <a>show history</a>
            </Link>
          </div>
        </div>}
      {path &&
        view === 'commits' &&
        <div>
          <h2>
            {login}/{repository}/{view}/{path}
          </h2>
          <small>Commits:</small>
          <Commits {...query} />
        </div>}
      {path &&
        (view === 'edit' || view === 'new') &&
        <div>
          <h2>
            {login}/{repository}/{view}/{path}
          </h2>
          <Editor {...query} />
          <ProcessToolbar>
            <h4>Checklist</h4>
            <Checklist />
            <h4>History</h4>
            <FileCommits {...query} />
            <h4>TODO: Others working</h4>
          </ProcessToolbar>
        </div>}
    </App>
  )
})
