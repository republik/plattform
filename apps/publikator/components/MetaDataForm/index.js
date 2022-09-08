import { useState, useRef } from 'react'
import { css } from 'glamor'
import {
  Scroller,
  TabButton,
  Field,
  Checkbox,
  mediaQueries,
  useColorContext,
  TeaserFeed,
} from '@project-r/styleguide'
import scrollIntoView from 'scroll-into-view'
import withT from '../../lib/withT'
import { MetaOption, MetaOptionLabel, AutosizeInput } from './components/Layout'
import SocialMedia from './components/SocialMedia'
import RepoSelect from '../editor/modules/meta/RepoSelect'

export const FLYER_FORMAT = {
  id: 'flyer',
  repoId: 'https://github.com/republik/format-journal',
  meta: {
    title: 'Republik-Journal',
    color: '#405080',
    kind: 'flyer',
  },
}

const styles = {
  metaContainer: css({
    maxWidth: 640,
    margin: '0px auto',
    padding: '24px 15px 120px 15px',
    [mediaQueries.mUp]: {
      padding: '24px 0 120px 0',
    },
  }),
  metaHeader: css({ position: 'sticky', top: 80, zIndex: 9 }),
  metaSection: css({ ':not(:first-child)': { marginTop: 128 } }),
  metaSectionTitle: css({ margin: '24px 0' }),
}

const MetaSection = ({ children }) => {
  return <div {...styles.metaSection}>{children}</div>
}

const MetaSectionTitle = ({ children }) => {
  return <h3 {...styles.metaSectionTitle}>{children}</h3>
}

const MetaDataForm = ({ t, metaData, setMetaData }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [colorScheme] = useColorContext()
  const scrollRef = useRef()

  const handleMetaDataChange = (name, value) => {
    setMetaData((prevState) => {
      return {
        ...prevState,
        [name]: value,
      }
    })
  }

  return (
    <div {...colorScheme.set('backgroundColor', 'hover')}>
      <div {...styles.metaContainer}>
        <h2>Metadaten</h2>
        <div
          {...styles.metaHeader}
          {...colorScheme.set('backgroundColor', 'hover')}
        >
          <Scroller innerPadding={0} activeChildIndex={activeTabIndex}>
            {['Beitrag', 'Social Media'].map((n, i) => (
              <TabButton
                key={n}
                text={n}
                isActive={activeTabIndex === i}
                onClick={() => {
                  setActiveTabIndex(i)

                  const target = Array.from(scrollRef.current.children)[i]
                  // since scroller also uses scrollIntoView we need to wait
                  setTimeout(() => {
                    scrollIntoView(target, {
                      time: 400,
                      align: {
                        topOffset: 100,
                      },
                    })
                  }, 100)
                }}
              />
            ))}
          </Scroller>
        </div>
        <div ref={scrollRef}>
          <MetaSection>
            <MetaSectionTitle>Beitrag</MetaSectionTitle>
            <MetaOption>
              <Field
                label='Titel'
                name='title'
                value={metaData.title}
                onChange={(event) => {
                  handleMetaDataChange(event.target.name, event.target.value)
                }}
                noMargin
                renderInput={({ ref, ...inputProps }) => (
                  <AutosizeInput {...inputProps} ref={ref} />
                )}
              />
            </MetaOption>
            <MetaOption>
              <Field
                label='Kurztitel'
                name='shortTitle'
                value={metaData.shortTitle}
                onChange={(event) => {
                  handleMetaDataChange(event.target.name, event.target.value)
                }}
                noMargin
                renderInput={({ ref, ...inputProps }) => (
                  <AutosizeInput {...inputProps} ref={ref} />
                )}
              />
            </MetaOption>
            <MetaOption>
              <Field
                label='Lead'
                name='lead'
                value={metaData.lead}
                onChange={(event) => {
                  handleMetaDataChange(event.target.name, event.target.value)
                }}
                noMargin
                renderInput={({ ref, ...inputProps }) => (
                  <AutosizeInput {...inputProps} ref={ref} />
                )}
              />
            </MetaOption>
            <MetaOption>
              <Field
                label='Slug'
                name='slug'
                value={metaData.slug}
                onChange={(event) => {
                  handleMetaDataChange(event.target.name, event.target.value)
                }}
                noMargin
              />
            </MetaOption>
            <MetaOption>
              <RepoSelect
                label='Format'
                value={metaData.format}
                template='format'
                onChange={(_, __, item) => {
                  handleMetaDataChange(
                    'format',
                    item ? `https://github.com/${item.value.id}` : undefined,
                  )
                }}
              />
            </MetaOption>
            <MetaOption>
              <MetaOptionLabel>Feed-Sichtbarkeit</MetaOptionLabel>
              <Checkbox
                checked={metaData.feed}
                onChange={(_, checked) => {
                  handleMetaDataChange('feed', checked)
                }}
              >
                Im Feed anzeigen
              </Checkbox>
            </MetaOption>
            <MetaOption>
              <MetaOptionLabel>Feed Vorschau</MetaOptionLabel>
              <div style={{ backgroundColor: 'white', padding: 15 }}>
                <TeaserFeed
                  title={metaData.title}
                  kind='flyer'
                  format={FLYER_FORMAT}
                />
              </div>
            </MetaOption>
          </MetaSection>
          <MetaSection>
            <MetaSectionTitle>Social Media</MetaSectionTitle>
            <SocialMedia data={metaData} onChange={handleMetaDataChange} />
          </MetaSection>
        </div>
      </div>
    </div>
  )
}

export default withT(MetaDataForm)
