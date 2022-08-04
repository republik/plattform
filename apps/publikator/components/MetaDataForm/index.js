import { useState, useEffect, useRef } from 'react'
import { css, style } from 'glamor'
import {
  Scroller,
  TabButton,
  Field,
  mediaQueries,
  useColorContext,
  fontStyles,
  Label,
} from '@project-r/styleguide'
import scrollIntoView from 'scroll-into-view'
import withT from '../../lib/withT'
import GooglePreview from '../editor/modules/meta/GooglePreview'

const styles = {
  metaContainer: css({
    maxWidth: 640,
    margin: '0 auto',
    padding: '0 15px 120px 15px',
    [mediaQueries.mUp]: {
      padding: '0 0 120px 0',
    },
  }),
  metaHeader: css({ position: 'sticky', top: 80, zIndex: 9 }),
  metaSection: css({ ':not(:first-child)': { marginTop: 128 } }),
  metaSectionTitle: css({}),
  metaOption: css({ marginBottom: 24 }),
  metaOptionLabel: css({ margin: 0 }),
}

const MetaSection = ({ children }) => {
  return <div {...styles.metaSection}>{children}</div>
}

const MetaSectionTitle = ({ children }) => {
  return <h3 {...styles.metaSectionTitle}>{children}</h3>
}

const MetaOption = ({ children }) => {
  return <div {...styles.metaOption}>{children}</div>
}

const MetaOptionLabel = ({ children }) => {
  return <Label {...styles.metaOptionLabel}>{children}</Label>
}

const MetaDataForm = ({ t, metaData, setMetaData }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [colorScheme] = useColorContext()
  const scrollRef = useRef()

  useEffect(() => {
    if (!scrollRef.current) {
      return
    }
    const scroller = scrollRef.current
    const target = Array.from(scroller.children)[activeTabIndex]

    scrollIntoView(target, {
      time: 400,
    })
  }, [activeTabIndex])

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setMetaData((prevState) => {
      return {
        ...prevState,
        [name]: value,
      }
    })
  }

  return (
    <div {...colorScheme.set('background-color', 'hover')}>
      <div {...styles.metaContainer}>
        <h2>Metadaten</h2>
        <div
          {...styles.metaHeader}
          {...colorScheme.set('background-color', 'hover')}
        >
          <Scroller innerPadding={0} activeChildIndex={activeTabIndex}>
            {['Beitrag'].map((n, i) => (
              <TabButton
                key={n}
                text={n}
                isActive={activeTabIndex === i}
                onClick={() => {
                  setActiveTabIndex(i)
                }}
              />
            ))}
          </Scroller>
        </div>
        <div ref={scrollRef}>
          <MetaSection>
            <MetaSectionTitle>Beitrag</MetaSectionTitle>
            <MetaOption>
              <MetaOptionLabel>Titel</MetaOptionLabel>
              <Field
                label=''
                placeholder='Titel'
                name='title'
                value={metaData.title}
                onChange={handleFieldChange}
              />
            </MetaOption>
            <MetaOption>
              <MetaOptionLabel>Slug</MetaOptionLabel>
              <Field
                label=''
                placeholder='Slug'
                name='slug'
                value={metaData.slug}
                onChange={setMetaData}
              />
            </MetaOption>
          </MetaSection>
          {/* <MetaSection>
            <MetaSectionTitle>SEO</MetaSectionTitle>
            <MetaOption>
              <Field
                label='Titel'
                name='title'
                value={value.title}
                onChange={onChange}
              />
            </MetaOption>
            <MetaOption>
              <Field
                label='Lead'
                name='lead'
                value={value.lead}
                onChange={onChange}
              />
            </MetaOption>
            <MetaOption>
              <MetaOptionTitle>
                {t('metaData/field/googlePreview')}
              </MetaOptionTitle>
              <GooglePreview
                title={value.seoTitle || value.twitterTitle || value.title}
                description={
                  value.seoDescription ||
                  value.twitterDescription ||
                  value.description
                }
                publishDate={value.previewPublishDate}
                path={value.path}
              />
            </MetaOption>
          </MetaSection>
          <MetaSection>
            <MetaSectionTitle>Social Media</MetaSectionTitle>
            <MetaOption>
              <Field
                label='Titel'
                name='title'
                value={value.title}
                onChange={onChange}
              />
            </MetaOption>
            <MetaOption>
              <Field
                label='Lead'
                name='lead'
                value={value.lead}
                onChange={onChange}
              />
            </MetaOption>
          </MetaSection> */}
        </div>
      </div>
    </div>
  )
}

export default withT(MetaDataForm)
