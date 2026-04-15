import { graphql } from '@apollo/client/react/hoc'
import {
  A,
  plainButtonRule,
  TeaserSectionTitle,
  useColorContext,
} from '@project-r/styleguide'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { useEffect, useMemo, useState } from 'react'
import withT from '../../lib/withT'
import { withMembership } from '../Auth/checkRoles'
import { possibleSubscriptions } from './enhancers'
import SubscribeCheckbox from './SubscribeCheckbox'

const styles = {
  checkboxes: css({
    margin: '8px 0 16px',
  }),
}

const FormatCheckboxes = ({ formats }) => (
  <div {...styles.checkboxes}>
    {formats.map((format, i) => (
      <SubscribeCheckbox
        key={i}
        subscription={format.subscribedByMe}
        filterName='Document'
      />
    ))}
  </div>
)

const getSuggestSubscription = (section) => section.meta.suggestSubscription

const getSubscriptionCount = (section) =>
  section.formats.nodes.filter((f) => f.subscribedByMe.active).length

const getVisibleSections = (sections, prevShown = []) =>
  sections.filter(
    (section) =>
      prevShown.find((s) => s.id === section.id) ||
      getSubscriptionCount(section) ||
      getSuggestSubscription(section),
  )

const SubscribedDocuments = ({ t, data: { sections } }) => {
  const [showAll, setShowAll] = useState(false)
  const [colorScheme] = useColorContext()
  const sectionNodes = sections && sections.nodes
  const sectionsWithFormat = useMemo(() => {
    return sectionNodes
      ? sectionNodes.filter((s) => s.formats.nodes.length > 0)
      : []
  }, [sectionNodes])

  const [visibleSections, setVisibleSections] = useState(
    getVisibleSections(sectionsWithFormat || []),
  )

  useEffect(() => {
    setVisibleSections((prevShown) =>
      getVisibleSections(sectionsWithFormat, prevShown),
    )
  }, [sectionsWithFormat])

  const totalSubs =
    sectionsWithFormat &&
    sectionsWithFormat.reduce(
      (reducer, section) => reducer + getSubscriptionCount(section),
      0,
    )

  if (!sectionsWithFormat || !sectionsWithFormat.length) return null

  return (
    <>
      {(showAll ? sectionsWithFormat : visibleSections).map((section) => (
        <div
          {...colorScheme.set(
            'color',
            section.meta?.color || 'textSoft',
            'format',
          )}
          key={section.id}
        >
          <TeaserSectionTitle small>{section.meta.title}</TeaserSectionTitle>
          <FormatCheckboxes formats={section.formats.nodes} />
        </div>
      ))}
      {sectionsWithFormat.length !== visibleSections.length && (
        <button
          {...plainButtonRule}
          onClick={() => {
            setVisibleSections(getVisibleSections(sectionsWithFormat))
            setShowAll(!showAll)
          }}
        >
          <A>
            {t(`Notifications/settings/formats/${showAll ? 'hide' : 'show'}`)}
          </A>
        </button>
      )}
    </>
  )
}

export default compose(
  withT,
  withMembership,
  graphql(possibleSubscriptions),
)(SubscribedDocuments)
