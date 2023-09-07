import { css } from 'glamor'
import { color } from 'd3-color'

import withT from '../../lib/withT'
import {
  Checkbox,
  Slider,
  Editorial,
  mediaQueries,
  fontStyles,
  plainButtonRule,
} from '@project-r/styleguide'

import createPersistedState from '../../lib/hooks/use-persisted-state'

import { Paragraph } from './Shared'
import Spider, { axes as spiderAxes } from './Spider'
import medianSmartspiders from './medianSmartspiders'
import getPartyColor from './partyColors'

export const useCardPreferences = createPersistedState(
  'republik-card-preferences',
)

const styles = {
  smallCheckbox: css({
    display: 'inline-block',
    minWidth: 150,
    marginRight: 5,
    marginBottom: 5,
  }),
  mySmartspider: css({
    position: 'relative',
  }),
  mySmartspiderSpider: css({
    [mediaQueries.mUp]: {
      position: 'absolute',
      right: 0,
      top: 0,
    },
  }),
  mySmartspiderSlider: css({
    marginBottom: 5,
  }),
  medianSmartspider: css(plainButtonRule, {
    border: '2px solid transparent',
    display: 'inline-block',
    textAlign: 'center',
    ...fontStyles.sansSerifMedium,
    fontSize: 14,
    padding: 1,
    ':first-child': {
      marginLeft: -1,
    },
    ':last-child': {
      marginRight: -1,
    },
  }),
}

const inactiveValue = -1
const nullSmartspider = [
  inactiveValue,
  inactiveValue,
  inactiveValue,
  inactiveValue,
  inactiveValue,
  inactiveValue,
  inactiveValue,
  inactiveValue,
]

const Filters = ({ t, party, onParty, forcedVariables = {} }) => {
  const [preferences, setPreferences] = useCardPreferences({})

  const setSlider = (newValue, i) =>
    setPreferences((p) => {
      let newSmartspider = [
        ...(p.mySmartspider || nullSmartspider).slice(0, i),
        newValue,
        ...(p.mySmartspider || nullSmartspider).slice(i + 1),
      ]
      if (newSmartspider.every((v) => v === inactiveValue)) {
        newSmartspider = undefined
      }
      return {
        ...p,
        mySmartspiderSort:
          p.mySmartspiderSort === undefined
            ? newValue >= 0
              ? true
              : undefined
            : p.mySmartspiderSort,
        mySmartspider: newSmartspider,
      }
    })

  return (
    <>
      <Paragraph style={{ marginBottom: 10 }}>
        <strong>{t('components/Card/Preferences/filter')}</strong>
      </Paragraph>
      <span {...styles.smallCheckbox}>
        <Checkbox
          checked={!!preferences.portrait}
          onChange={(_, checked) => {
            setPreferences((p) => ({ ...p, portrait: checked }))
          }}
        >
          {t('components/Card/Preferences/filter/portrait')}
        </Checkbox>
      </span>
      <span {...styles.smallCheckbox}>
        <Checkbox
          checked={!!preferences.smartspider}
          onChange={(_, checked) => {
            setPreferences((p) => ({ ...p, smartspider: checked }))
          }}
        >
          {t('components/Card/Preferences/filter/smartspider')}
        </Checkbox>
      </span>
      <span {...styles.smallCheckbox}>
        <Checkbox
          checked={!!preferences.statement}
          onChange={(_, checked) => {
            setPreferences((p) => ({ ...p, statement: checked }))
          }}
        >
          {t('components/Card/Preferences/filter/statement')}
        </Checkbox>
      </span>
      {!forcedVariables.elected && (
        <span {...styles.smallCheckbox}>
          <Checkbox
            checked={!!preferences.elected}
            onChange={(_, checked) => {
              setPreferences((p) => ({ ...p, elected: checked }))
            }}
          >
            {t('components/Card/Preferences/filter/elected')}
          </Checkbox>
        </span>
      )}
      <span {...styles.smallCheckbox}>
        <Checkbox
          checked={!!preferences.financing}
          onChange={(_, checked) => {
            setPreferences((p) => ({ ...p, financing: checked }))
          }}
        >
          {t('components/Card/Preferences/filter/financing')}
        </Checkbox>
      </span>
      <br style={{ clear: 'left' }} />
      <br />
      <Paragraph style={{ marginBottom: 10 }}>
        <strong>{t('components/Card/Preferences/medianSmartspiders')}</strong>
      </Paragraph>
      <div>
        {medianSmartspiders.map((medianSmartspider) => {
          const fill = getPartyColor(medianSmartspider.value)
          const active = party === medianSmartspider.value
          return (
            <button
              key={medianSmartspider.value}
              {...styles.medianSmartspider}
              onClick={(e) => {
                e.preventDefault()
                onParty(active ? undefined : medianSmartspider.value)
              }}
              style={{
                color: color(fill).darker(0.5),
                borderColor: active ? 'var(--color-primary)' : undefined,
              }}
            >
              <Spider
                label={false}
                size={55}
                fill={fill}
                data={medianSmartspider.smartspider}
                reference={preferences.mySmartspider}
              />
              <br />
              {medianSmartspider.label || medianSmartspider.value}
            </button>
          )
        })}
      </div>
      <br />
      <Paragraph>
        {t('components/Card/Preferences/medianSmartspiders/explanation')}
      </Paragraph>
      <br />
      <Paragraph>
        <strong>{t('components/Card/Preferences/mySmartspider')}</strong>
      </Paragraph>
      <Paragraph>
        {t.elements('components/Card/Preferences/mySmartspider/intro', {
          link: (
            <Editorial.A
              key='link'
              href={t(
                'components/Card/Preferences/mySmartspider/intro/linkHref',
              )}
            >
              {t('components/Card/Preferences/mySmartspider/intro/linkText')}
            </Editorial.A>
          ),
        })}
      </Paragraph>
      <br />

      <div {...styles.mySmartspider}>
        {(preferences.mySmartspider || nullSmartspider).map((value, i) => {
          const onUp = (e) => {
            if (e.target.value < 0) {
              setSlider(inactiveValue, i)
            }
          }
          const label = `${spiderAxes[i].text.replace(/\n/g, ' ').trim()}: ${
            value < 0 ? 'keine Angaben' : value
          }`
          return (
            <div key={i} {...styles.mySmartspiderSlider}>
              <Slider
                label={label}
                value={value}
                min={inactiveValue}
                max='100'
                inactive={value < 0 || value === null}
                onChange={(e, newValue) => {
                  setSlider(newValue, i)
                }}
                onMouseUp={onUp}
                onTouchEnd={onUp}
              />
              <br />
            </div>
          )
        })}
        {preferences.mySmartspider && (
          <>
            <br />
            <Checkbox
              checked={!!preferences.mySmartspiderSort && !party}
              onChange={(_, checked) => {
                onParty()
                setPreferences((p) => ({ ...p, mySmartspiderSort: checked }))
              }}
            >
              {t('components/Card/Preferences/mySmartspider/sort')}
            </Checkbox>
            <br style={{ clear: 'left' }} />
            <div {...styles.mySmartspiderSpider}>
              <Spider
                size={280}
                fill='#000'
                fillOpacity={0.3}
                data={preferences.mySmartspider.map((v) => Math.max(0, v))}
                reference={preferences.mySmartspider}
              />
            </div>
            <br />
            <br />
            <Editorial.A
              href='#'
              onClick={(e) => {
                e.preventDefault()
                if (
                  window.confirm(
                    t('components/Card/Preferences/mySmartspider/resetConfirm'),
                  )
                ) {
                  setPreferences(({ mySmartspider, ...rest }) => rest)
                }
              }}
            >
              {t('components/Card/Preferences/mySmartspider/reset')}
            </Editorial.A>
          </>
        )}
      </div>
    </>
  )
}

export default withT(Filters)
