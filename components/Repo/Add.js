import React, { Component } from 'react'
import { Router } from '../../lib/routes'
import slugify from '../../lib/utils/slug'
import schemas from '../Templates'
import { css } from 'glamor'
import withT from '../../lib/withT'

import {
  Interaction,
  Field,
  Button,
  Dropdown,
  mediaQueries
} from '@project-r/styleguide'

import { GITHUB_ORG, TEMPLATES, REPO_PREFIX } from '../../lib/settings'

let templateKeys = Object.keys(schemas)
if (TEMPLATES) {
  const allowedTemplates = TEMPLATES.split(',')
  templateKeys = templateKeys.filter(
    key => allowedTemplates.indexOf(key) !== -1
  )
}

const styles = {
  new: css({
    maxWidth: 600,
    paddingBottom: 60
  }),
  form: css({
    display: 'flex',
    justifyContent: 'space-between',
    flexFlow: 'row wrap',
    margin: '0 auto'
  }),
  select: css({
    width: '100%',
    marginTop: 10
  }),
  input: css({
    width: '100%',
    [mediaQueries.mUp]: {
      marginRight: 10,
      marginBottom: 0,
      width: '58%'
    }
  }),
  button: css({
    width: '100%',
    [mediaQueries.mUp]: {
      width: '38%',
      minWidth: 160
    }
  })
}

class RepoAdd extends Component {
  constructor(props) {
    super(props)
    this.state = {
      title: '',
      template: ''
    }
  }
  getSlug(title) {
    const { template } = this.state
    const schema = schemas[template]
    const prefix = [REPO_PREFIX, schema && schema.repoPrefix]
      .filter(Boolean)
      .join('')
    const slug = [prefix, slugify(title)].join('')

    return slug
  }
  onSubmit(event) {
    event.preventDefault()

    const { title, template, error } = this.state
    const slug = this.getSlug(title)
    if (error || !title || slug.length > 100) {
      this.handleTitle(title, true)
      return
    }

    Router.replaceRoute('repo/edit', {
      repoId: [GITHUB_ORG, slug],
      commitId: 'new',
      title,
      template
    }).then(() => {
      window.scrollTo(0, 0)
    })
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
        (slug.length > 100 && t('repo/add/titleField/error/tooLong'))
    })
  }
  render() {
    const { t } = this.props
    const { title, template, dirty, error } = this.state

    const templateOptions = templateKeys.map(key => ({
      value: key,
      text: t(`repo/add/template/${key}`, null, key)
    }))

    return (
      <div {...styles.new}>
        <Interaction.H2>{t('repo/add/title')}</Interaction.H2>
        <form
          {...styles.form}
          onSubmit={e => this.onSubmit(e)}
          onKeyPress={e => {
            if (e.key === 'Enter') {
              this.onSubmit(e)
            }
          }}
        >
          <div {...styles.select}>
            <Dropdown
              label='Vorlage'
              items={templateOptions}
              value={template}
              onChange={item => {
                this.setState({ template: item.value })
              }}
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

export default withT(RepoAdd)
