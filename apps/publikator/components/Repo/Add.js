import { Component, useState, useMemo } from 'react'
import { slug as slugify } from '@project-r/styleguide'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import schemas from '../Templates'
import { css } from 'glamor'
import withT from '../../lib/withT'
import { ascending } from 'd3-array'

import {
  Interaction,
  Field,
  Button,
  Dropdown,
  Autocomplete,
  mediaQueries,
  colors,
  Loader,
  A,
} from '@project-r/styleguide'

import {
  GITHUB_ORG,
  TEMPLATES,
  REPO_PREFIX,
  TEMPLATE_PREFIX,
} from '../../lib/settings'

import { withRouter } from 'next/router'
import { IconInfoOutline as InfoIcon, IconSearch } from '@republik/icons'

const getTemplateRepos = gql`
  query templateListSearch {
    reposSearch(isTemplate: true, first: 200) {
      totalCount
      nodes {
        id
        latestCommit {
          id
          document {
            id
            meta {
              title
              slug
              template
            }
          }
        }
      }
    }
  }
`

let schemaKeys = Object.keys(schemas)
if (TEMPLATES) {
  const allowedSchemas = TEMPLATES.split(',')
  schemaKeys = schemaKeys.filter((key) => allowedSchemas.indexOf(key) !== -1)
}

const templateSchemas = ['article', 'editorialNewsletter']

const styles = {
  new: css({
    maxWidth: 600,
    paddingBottom: 60,
  }),
  form: css({
    display: 'flex',
    justifyContent: 'space-between',
    flexFlow: 'row wrap',
    margin: '0 auto',
  }),
  select: css({
    width: '100%',
    marginTop: 10,
  }),
  input: css({
    width: '100%',
    [mediaQueries.mUp]: {
      marginRight: 10,
      marginBottom: 0,
      width: '58%',
    },
  }),
  button: css({
    width: '100%',
    [mediaQueries.mUp]: {
      width: '38%',
      minWidth: 160,
    },
  }),
  infoLink: css({
    display: 'inline-block',
    verticalAlign: 'top',
    marginLeft: '0.6em',
    fontSize: '0.6em',
  }),
}

const TemplatePicker = compose(
  withT,
  withRouter,
  graphql(getTemplateRepos, {
    options: () => ({
      ssr: false, // Disable SSR because of React hydration error
      fetchPolicy: 'network-only',
    }),
    skip: ({ isTemplate }) => isTemplate,
  }),
)(({ t, data, schema, onChange, isTemplate }) => {
  const [templateFilter, setTemplateFilter] = useState('')
  const [template, setTemplate] = useState({
    value: schema,
    text: t(`repo/add/template/${schema}`, null, schema),
  })

  const schemaOptions = useMemo(
    () =>
      schemaKeys
        .filter((key) => !isTemplate || templateSchemas.includes(key))
        .map((key) => ({
          value: key,
          text: t(`repo/add/template/${key}`, null, key),
        })),
    [isTemplate],
  )
  const templateOptions = useMemo(() => {
    return schemaOptions
      .concat(
        (data?.reposSearch?.nodes || [])
          .map((repo) => ({
            value: repo.latestCommit.document.meta.template,
            text: repo.latestCommit.document.meta.title,
            repoId: repo.id,
            slug: repo.latestCommit.document.meta.slug,
          }))
          .sort((repo1, repo2) =>
            ascending(repo1.text?.toLowerCase(), repo2.text?.toLowerCase()),
          ),
      )
      .filter(
        ({ text }) =>
          !templateFilter ||
          !text ||
          text.toLowerCase().includes(templateFilter.toLowerCase()),
      )
  }, [data, templateFilter, schemaOptions])

  return isTemplate ? (
    <Dropdown
      label='Vorlage'
      items={schemaOptions}
      value={schema}
      onChange={(item) => {
        onChange({
          schema: item.value,
          templateRepoId: undefined,
          templateRepoPrefix: undefined,
        })
      }}
    />
  ) : (
    <Loader
      error={data.error}
      loading={data.loading}
      render={() => (
        <Autocomplete
          label='Vorlage'
          value={template}
          filter={templateFilter}
          items={templateOptions}
          onChange={(newTemplate) => {
            setTemplate(newTemplate)
            setTemplateFilter('')
            onChange({
              schema: newTemplate.value,
              templateRepoId: newTemplate.repoId,
              templateRepoPrefix: newTemplate.slug
                ? newTemplate.slug + '-'
                : undefined,
            })
          }}
          onFilterChange={(newFilter) => {
            if (!template || template.text !== newFilter) {
              setTemplateFilter(newFilter)
            }
          }}
          icon={<IconSearch size={30} style={{ color: colors.lightText }} />}
        />
      )}
    />
  )
})

class RepoAdd extends Component {
  constructor(props) {
    super(props)
    const schema = schemaKeys.includes('article') ? 'article' : schemaKeys[0]
    this.state = {
      schema,
      title: '',
    }
  }
  getSlug() {
    const { title, schema, templateRepoPrefix } = this.state
    const { isTemplate } = this.props
    const prefix = (
      isTemplate
        ? [REPO_PREFIX, TEMPLATE_PREFIX]
        : [REPO_PREFIX, templateRepoPrefix || schemas[schema]?.repoPrefix]
    )
      .filter(Boolean)
      .join('')
    return [prefix, slugify(title)].join('')
  }

  goToEdit({ slug }) {
    const { title, schema, templateRepoId } = this.state
    const { isTemplate } = this.props
    this.props.router
      .push({
        pathname: `/repo/${GITHUB_ORG}/${slug}/edit`,
        query: {
          commitId: 'new',
          title,
          schema,
          templateRepoId,
          isTemplate,
        },
      })
      .then(() => {
        window.scrollTo(0, 0)
      })
  }

  onSubmit(event) {
    event.preventDefault()

    const { title, error } = this.state
    const slug = this.getSlug()

    if (error || !title || slug.length > 100) {
      this.handleTitle(title, true)
      return
    }
    this.goToEdit({ slug })
  }

  handleTitle(value, shouldValidate) {
    const { t } = this.props

    const slug = this.getSlug(value)
    this.setState({
      slug,
      title: value,
      dirty: shouldValidate,
      error:
        (value.trim().length <= 0 && t('repo/add/titleField/error')) ||
        (slug.length > 100 && t('repo/add/titleField/error/tooLong')),
    })
  }
  render() {
    const { t, isTemplate } = this.props
    const { title, schema, dirty, error } = this.state

    return (
      <div {...styles.new}>
        <Interaction.H2>
          {t(`repo/add${isTemplate ? '/template/' : '/'}title`)}
          {isTemplate && (
            <A
              {...styles.infoLink}
              href='https://github.com/orbiting/publikator-frontend/blob/master/docs/templates.md'
              target='_blank'
            >
              <InfoIcon />
            </A>
          )}
        </Interaction.H2>
        <form
          {...styles.form}
          onSubmit={(e) => this.onSubmit(e)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              this.onSubmit(e)
            }
          }}
        >
          <div {...styles.select}>
            <TemplatePicker
              isTemplate={isTemplate}
              schema={schema}
              onChange={this.setState.bind(this)}
            />
          </div>
          <div {...styles.input}>
            <Field
              label={t('repo/add/titleField/label')}
              value={title}
              onChange={(_, value, shouldValidate) => {
                this.handleTitle(value, shouldValidate)
              }}
              error={dirty && error}
            />
          </div>
          <div {...styles.button}>
            <Button type='submit' block>
              {t('repo/add/submit')}
            </Button>
          </div>
        </form>
      </div>
    )
  }
}

export default compose(withT, withRouter)(RepoAdd)
