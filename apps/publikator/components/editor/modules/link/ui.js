import {
  AuthorSearch,
  Field,
  Label,
  RawHtml,
  RepoSearch,
} from '@project-r/styleguide'
import { IconInfoOutline as MdInfoOutline, IconLink } from '@republik/icons'
import { css } from 'glamor'
import AutosizeInput from 'react-textarea-autosize'
import { Text } from 'slate'
import withT from '../../../../lib/withT'
import UIForm from '../../UIForm'

import { buttonStyles, createInlineButton, matchInline } from '../../utils'
import createOnFieldChange from '../../utils/createOnFieldChange'
import { AutoSlugLinkInfo } from '../../utils/github'

const styles = {
  autoSize: css({
    minHeight: 40,
    paddingTop: '7px !important',
    paddingBottom: '6px !important',
  }),
  descriptionHelp: css({
    margin: '-10px 0 10px',
  }),
}

const createForm =
  (options) =>
  ({ value, onChange }) => {
    const { TYPE } = options

    if (!value.inlines.some(matchInline(TYPE))) {
      return null
    }
    return (
      <div>
        <Label>Links</Label>
        <LinkForm
          TYPE={TYPE}
          nodes={value.inlines.filter(matchInline(TYPE))}
          value={value}
          onChange={onChange}
        />
      </div>
    )
  }

export const LinkForm = withT(
  ({ kind = 'inline', TYPE, nodes, value, onChange, t }) => {
    const handlerFactory = createOnFieldChange(onChange, value)
    const authorChange = (onChange, value, node) => (author) => {
      onChange(
        value.change().replaceNodeByKey(node.key, {
          type: TYPE,
          kind,
          data: node.data.merge({
            title: author.value.name,
            href: `/~${author.value.id}`,
          }),
          nodes: [Text.create(author.value.name)],
        }),
      )
    }
    const repoChange = (onChange, value, node) => (item) => {
      onChange(
        value.change().setNodeByKey(node.key, {
          data: node.data.merge({
            title: item.text,
            href: `https://github.com/${item.value.id}?autoSlug`,
          }),
        }),
      )
    }

    return (
      <>
        {nodes.map((node, i) => {
          const onInputChange = handlerFactory(node)
          return (
            <UIForm key={`link-form-${i}`}>
              <Field
                label={t(`metaData/field/href`, undefined, 'href')}
                value={node.data.get('href')}
                onChange={onInputChange('href')}
              />
              <AutoSlugLinkInfo
                value={node.data.get('href')}
                label={t('metaData/field/href/document')}
              />
              <Field
                label={t(`metaData/field/title`, undefined, 'title')}
                value={node.data.get('title')}
                onChange={onInputChange('title')}
              />
              <Field
                label={t(`link/description`, undefined, 'description')}
                value={node.data.get('description')}
                onChange={onInputChange('description')}
                renderInput={({ ref, ...inputProps }) => (
                  <AutosizeInput
                    {...inputProps}
                    inputRef={ref}
                    {...styles.autoSize}
                  />
                )}
              />
              <p {...styles.descriptionHelp}>
                <small>
                  <MdInfoOutline style={{ verticalAlign: 'sub' }} />{' '}
                  <RawHtml
                    dangerouslySetInnerHTML={{
                      __html: t('link/description/help'),
                    }}
                  />
                </small>
              </p>
              <AuthorSearch onChange={authorChange(onChange, value, node)} />
              <RepoSearch
                label={t('link/repo/search')}
                onChange={repoChange(onChange, value, node)}
              />
            </UIForm>
          )
        })}
      </>
    )
  },
)

const createLink = (options) =>
  createInlineButton({
    type: options.TYPE,
    parentTypes: options.parentTypes,
  })(({ active, disabled, visible, ...props }) => (
    <span
      {...buttonStyles.mark}
      {...props}
      data-active={active}
      data-disabled={disabled}
      data-visible={visible}
    >
      <IconLink size={24} />
    </span>
  ))

export default (options) => {
  return {
    forms: [createForm(options)],
    textFormatButtons: [createLink(options)],
  }
}
