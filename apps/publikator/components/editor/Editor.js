import { Editor as SlateEditor } from '@republik/slate-react'
import { css } from 'glamor'
import PropTypes from 'prop-types'
import { Component } from 'react'

import Loader from '../Loader'
import createArticleCollection from './modules/article/collection'
import createArticleGroup from './modules/article/group'
import createAuthorModule from './modules/author'
import createBlockQuoteModule from './modules/blockquote'
import createBlockTextModule from './modules/blocktext'
import createButtonModule from './modules/button'
import createCenterModule from './modules/center'
import createChartModule from './modules/chart'
import createChartCanvasModule from './modules/chart/canvas'
import createCoverModule from './modules/cover'

import createDocumentModule from './modules/document'
import createDocumentPlainModule from './modules/document/plain'
import createFrontDossier from './modules/dossier/front'
import createDossierIntro from './modules/dossier/intro'
import createDynamicComponentModule from './modules/dynamiccomponent'
import {
  createEmbedCommentModule,
  createEmbedTwitterModule,
  createEmbedVideoModule,
} from './modules/embed'
import createEmbedDatawrapperModule from './modules/embeddatawrapper'
import createFigureModule from './modules/figure'
import createFigureCaptionModule from './modules/figure/caption'
import createFigureImageModule from './modules/figure/image'
import createFigureGroupModule from './modules/figuregroup'
import createFrontModule from './modules/front'
import createHeadlineModule from './modules/headline'
import createHtmlModule from './modules/html'
import createInfoBoxModule from './modules/infobox'
import createInterviewAnswerModule from './modules/interviewanswer'
import createLineModule from './modules/line'
import createLinkModule from './modules/link'
import createListModule from './modules/list'
import createListItemModule from './modules/list/item'
import createLiveTeaserModule from './modules/liveteaser'
import createLogbookModule from './modules/logbook'
import createMarkModule from './modules/mark'
import createMemoModule from './modules/memo'
import createMetaModule from './modules/meta'
import createParagraphModule from './modules/paragraph'
import createQuoteModule from './modules/quote'
import createSeriesNavModule from './modules/seriesnav'
import createSpecialModule from './modules/special'
import createSpecialCharsModule from './modules/specialchars'
import createTeaserModule from './modules/teaser'
import createTeaserGroupModule from './modules/teasergroup'
import createTitleModule from './modules/title'
import createVariableModule from './modules/variable'
import createVariableConditionModule from './modules/variable/condition'

const moduleCreators = {
  embedVideo: createEmbedVideoModule,
  embedTwitter: createEmbedTwitterModule,
  embedComment: createEmbedCommentModule,
  embedDatawrapper: createEmbedDatawrapperModule,
  document: createDocumentModule,
  documentPlain: createDocumentPlainModule,
  cover: createCoverModule,
  center: createCenterModule,
  headline: createHeadlineModule,
  paragraph: createParagraphModule,
  link: createLinkModule,
  mark: createMarkModule,
  memo: createMemoModule,
  blockquote: createBlockQuoteModule,
  blocktext: createBlockTextModule,
  list: createListModule,
  listItem: createListItemModule,
  figure: createFigureModule,
  figureImage: createFigureImageModule,
  figureCaption: createFigureCaptionModule,
  figuregroup: createFigureGroupModule,
  special: createSpecialModule,
  logbook: createLogbookModule,
  interviewAnswer: createInterviewAnswerModule,
  meta: createMetaModule,
  specialchars: createSpecialCharsModule,
  title: createTitleModule,
  infobox: createInfoBoxModule,
  quote: createQuoteModule,
  front: createFrontModule,
  teaser: createTeaserModule,
  teasergroup: createTeaserGroupModule,
  html: createHtmlModule,
  line: createLineModule,
  articleGroup: createArticleGroup,
  frontDossier: createFrontDossier,
  carousel: createFrontDossier,
  dossierIntro: createDossierIntro,
  articleCollection: createArticleCollection,
  chart: createChartModule,
  chartCanvas: createChartCanvasModule,
  dynamiccomponent: createDynamicComponentModule,
  liveteaser: createLiveTeaserModule,
  button: createButtonModule,
  variable: createVariableModule,
  variableCondition: createVariableConditionModule,
  seriesNav: createSeriesNavModule,
  author: createAuthorModule,
}
const initModule = (rule, context = {}) => {
  const { editorModule, editorOptions = {} } = rule
  if (editorModule) {
    const create = moduleCreators[editorModule]
    if (!create) {
      throw new Error(`Missing editorModule ${editorModule}`)
    }
    const TYPE = (editorOptions.type || editorModule).toUpperCase()
    const subModules = (rule.rules || [])
      .map((r) => initModule(r, context))
      .filter(Boolean)
    const module = create({
      TYPE,
      rule,
      subModules: subModules,
      context,
    })

    module.TYPE = TYPE
    module.name = editorModule
    module.subModules = subModules

    return module
  }
}
const getAllModules = (module) =>
  [module].concat(
    (module.subModules || []).reduce(
      (collector, subModule) => collector.concat(getAllModules(subModule)),
      [],
    ),
  )
export const getFromModules = (modules, accessor) =>
  modules
    .reduce((collector, m) => collector.concat(accessor(m)), [])
    .filter(Boolean)

const styles = {
  container: css({
    width: '100%',
    position: 'relative',
  }),
  document: css({
    display: 'block',
    width: '100%',
  }),
}

const Container = ({ children, hide }) => (
  <div {...styles.container} style={{ display: hide ? 'none' : 'block' }}>
    {children}
  </div>
)

const Document = ({ children, readOnly }) => (
  <article
    {...styles.document}
    style={
      readOnly
        ? {
            pointerEvents: 'none',
            opacity: 0.6,
          }
        : {}
    }
  >
    {children}
  </article>
)

class Editor extends Component {
  constructor(props) {
    super(props)
    this.onChange = (change) => {
      const { value, onChange, onDocumentChange } = this.props

      if (change.value !== value) {
        onChange(change)
        if (!change.value.document.equals(value.document)) {
          onDocumentChange(change.value.document, change)
        }
      }
    }

    const schema = props.schema
    if (!schema) {
      throw new Error('missing schema prop')
    }
    const rootRule = schema.rules[0]
    const context = {
      mdastSchema: schema,
      meta: props.meta,
      isTemplate: props.isTemplate,
    }
    const rootModule = initModule(rootRule, context)

    this.serializer = context.rootSerializer = rootModule.helpers.serializer
    this.newDocument = rootModule.helpers.newDocument

    const allModules = getAllModules(rootModule)
    const uniqModules = allModules.filter(
      (m, i, a) => a.findIndex((mm) => mm.TYPE === m.TYPE) === i,
    )

    this.uniqModules = uniqModules
    this.plugins = [...getFromModules(uniqModules, (m) => m.plugins)]

    this.slateRef = (ref) => {
      this.slate = ref
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.schema !== this.props.schema) {
      throw new Error('changing schema is not supported')
    }
  }

  render() {
    const { value, readOnly, hide } = this.props
    return (
      <Container hide={hide}>
        <Loader
          loading={!value}
          render={() => (
            <Document readOnly={readOnly}>
              <SlateEditor
                ref={this.slateRef}
                value={value}
                onChange={this.onChange}
                plugins={this.plugins}
                readOnly={readOnly}
              />
            </Document>
          )}
        />
        {/* A full slate instance to normalize
               initially loaded docs but ignoring
               change events from it */}
        {!value && (
          <SlateEditor
            ref={this.slateRef}
            value={this.newDocument({ title: 'Loading...' })}
            plugins={this.plugins}
            readOnly
          />
        )}
      </Container>
    )
  }
}

Editor.propTypes = {
  value: PropTypes.object,
  readOnly: PropTypes.bool,
  onChange: PropTypes.func,
  onDocumentChange: PropTypes.func,
}

Editor.defaultProps = {
  onChange: () => true,
  onDocumentChange: () => true,
}

export default Editor
