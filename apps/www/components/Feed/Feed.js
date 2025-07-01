import { Component } from 'react'
import compose from 'lodash/flowRight'
import { nest } from 'd3-collection'
import { timeFormat } from '../../lib/utils/format'
import Link from '../Link/Href'
import withT from '../../lib/withT'
import ActionBar from '../ActionBar'
import StickySection from './StickySection'
import PropTypes from 'prop-types'
import formatCredits from './formatCredits'

import { TeaserFeed } from '@project-r/styleguide'

const dateFormat = timeFormat('%A,\n%d.%m.%Y')

const groupByDate = nest().key((d) => dateFormat(new Date(d.meta.publishDate)))

class Feed extends Component {
  renderFeedItem = (doc) => {
    return doc ? (
      <TeaserFeed
        {...doc.meta}
        format={doc.meta.format}
        skipFormat={this.props.skipFormat}
        repoId={doc.repoId}
        title={doc.meta.shortTitle || doc.meta.title}
        description={!doc.meta.shortTitle && doc.meta.description}
        t={this.props.t}
        credits={
          this.props.showHeader
            ? formatCredits(doc.meta.credits)
            : doc.meta.credits
        }
        publishDate={this.props.showHeader ? undefined : doc.meta.publishDate}
        kind={
          doc.meta.template === 'editorialNewsletter' ? 'meta' : doc.meta.kind
        }
        Link={Link}
        key={doc.meta.path}
        bar={<ActionBar mode='feed' document={doc} />}
      />
    ) : null
  }

  render() {
    const { documents, showHeader } = this.props

    if (showHeader) {
      return groupByDate.entries(documents).map(({ key, values }, i, all) => (
        <StickySection key={i} hasSpaceAfter={i < all.length - 1} label={key}>
          {values.map(this.renderFeedItem)}
        </StickySection>
      ))
    } else {
      return documents.map(this.renderFeedItem)
    }
  }
}

Feed.propTypes = {
  documents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      meta: PropTypes.shape({
        publishDate: PropTypes.string.isRequired,
      }),
      showHeader: PropTypes.bool,
      showSubscribe: PropTypes.bool,
    }).isRequired,
  ).isRequired,
}

Feed.defaultProps = {
  showHeader: true,
  documents: [],
}

export default compose(withT)(Feed)
