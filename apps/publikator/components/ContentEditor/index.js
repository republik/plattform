import { withRouter } from 'next/router'
import {
  flyerSchema,
  flyerStructure,
  RenderContextProvider,
  FlyerDate,
} from '@project-r/styleguide'
import { Editor, flyerEditorSchema } from '@project-r/styleguide/editor'
import withAuthorization from '../../components/Auth/withAuthorization'
import { HEADER_HEIGHT } from '../Frame/constants'
import compose from 'lodash/flowRight'
import withT from '../../lib/withT'

export const editorToolbarStyle = { top: HEADER_HEIGHT }

const TOOLBAR = {
  style: editorToolbarStyle,
  showChartCount: true,
}

const Index = ({
  value,
  repoId,
  commitId,
  publishDate,
  onChange,
  readOnly,
  t,
}) => {
  const nav = <FlyerDate date={publishDate} />
  return (
    <RenderContextProvider t={t} nav={nav} repoId={repoId} commitId={commitId}>
      {/* The Editor does its own RenderContextProvider
       * but we also need to do one from the main styleguide entry point
       * cause render components will use that context
       */}
      <Editor
        value={value}
        setValue={(newValue) => {
          onChange(newValue)
        }}
        config={{
          schema: flyerSchema,
          editorSchema: flyerEditorSchema,
          structure: flyerStructure,
          toolbar: TOOLBAR,
          readOnly,
          context: { t, nav, repoId, commitId },
        }}
      />
    </RenderContextProvider>
  )
}

export default compose(withT, withRouter, withAuthorization(['editor']))(Index)
