import { Interaction, Label, fontStyles, Chart } from '@project-r/styleguide'
import { css } from 'glamor'
import voteT from './voteT'
import { deduplicate } from '../../lib/utils/helpers'
import { NarrowCard } from './text'
const { P } = Interaction

const styles = {
  container: css({
    textAlign: 'center',
  }),
  charts: css({
    margin: '0 auto',
    maxWidth: 360,
  }),
  text: css({
    textAlign: 'center',
    width: '80%',
    margin: '30px auto 15px auto',
  }),
  chart: css({
    marginBottom: 20,
  }),
  mapLegend: css({
    ...fontStyles.sansSerifRegular12,
    fontFeatureSettings: '"tnum" 1, "kern" 1',
    padding: '3px 0 6px',
  }),
}

const MembersLocation = ({ members, isElected }) => {
  const values = members
    .filter((member) => member.postalCodeGeo?.countryCode === 'CH')
    .reduce((acc, { postalCodeGeo, city }) => {
      const currentLocation = acc.find(
        (point) => point.postalCode === postalCodeGeo.postalCode,
      )
      if (currentLocation) {
        currentLocation.count += 1
      } else {
        acc.push({
          ...postalCodeGeo,
          city,
          count: 1,
        })
      }
      return acc
    }, [])
    .map((point) => ({
      ...point,
      lat: String(point.lat),
      lon: String(point.lon),
      value: String(point.count),
    }))

  const outsideSwitzerland = members.filter(
    (c) => c.postalCodeGeo?.countryCode !== 'CH',
  )

  return (
    <div {...styles.chart}>
      <Chart
        config={{
          type: 'SwissMap',
          heightRatio: 0.63,
          features: {
            url: 'https://cdn.repub.ch/s3/republik-assets/assets/geo/ch-cantons-wo-lakes.json',
            object: 'cantons',
          },
          points: true,
          sizeRangeMax: 150,
          opacity: 0.5,
          colorLegend: false,
          tooltipLabel: '{city}, {postalCode}',
          tooltipBody: `${isElected ? 'Rätinnen' : 'Kandidatinnen'}: {count}`,
        }}
        values={values}
      />
      {!!outsideSwitzerland.length && (
        <div {...styles.mapLegend}>
          Nicht angezeigt:{' '}
          {outsideSwitzerland.length === 1
            ? `${isElected ? 'ein Mandat' : 'eine Kandidatur'}`
            : `${outsideSwitzerland.length} ${
                isElected ? 'Mandate' : 'Kandidaturen'
              }`}{' '}
          ausserhalb der Schweiz in{' '}
          {outsideSwitzerland
            .map((c) => `${c.city} (${c.postalCodeGeo.countryName})`)
            .filter(deduplicate)
            .join(', ')}
          .
        </div>
      )}
    </div>
  )
}

const getPercentString = (total) => (item) => ({
  ...item,
  value: String(item.value / total),
})

const GENDER = {
  weiblich: '#9467bd',
  divers: 'neutral',
  ['männlich']: '#2ca02c',
}

const MembersGender = voteT(({ members, vt }) => {
  const membersWithGender = members.filter((member) => member?.user?.gender)
  if (!membersWithGender.length) return null

  const values = membersWithGender
    .reduce(
      (acc, member) =>
        acc.map((item) =>
          item.key ===
          (GENDER[member.user.gender] ? member.user.gender : 'divers')
            ? { ...item, value: item.value + 1 }
            : item,
        ),
      Object.keys(GENDER).map((key, idx) => ({
        key,
        value: 0,
        pos: idx === 0 ? 'left' : 'right',
      })),
    )
    .map(getPercentString(membersWithGender.length))

  return (
    <div {...styles.chart}>
      <div style={{ marginBottom: 3 }}>
        <Label>{vt('vote/election/confirm/gender/header')}</Label>
      </div>
      <Chart
        config={{
          type: 'Bar',
          numberFormat: '.0%',
          color: 'key',
          colorMap: GENDER,
          colorSort: 'none',
          colorLegend: true,
          colorLegendValues: Object.keys(GENDER),
          domain: [0, 1],
          sort: 'none',
          inlineValue: true,
          inlineLabelPosition: 'pos',
        }}
        values={values.filter((v) => v.value !== '0')}
      />
    </div>
  )
})

const getAge = (birthYear) => new Date().getFullYear() - birthYear

const AGES = {
  ['jünger als 30']: '#1f77b4',
  ['30 bis 39']: '#ff7f0e',
  ['40 bis 49']: '#2ca02c',
  ['50 bis 59']: '#d62728',
  ['60 Jahre und älter']: '#9467bd',
}
const AGE_KEYS = Object.keys(AGES)

const getLabel = (age) =>
  age < 30
    ? AGE_KEYS[0]
    : age < 40
    ? AGE_KEYS[1]
    : age < 50
    ? AGE_KEYS[2]
    : age < 60
    ? AGE_KEYS[3]
    : AGE_KEYS[4]

const MembersAge = voteT(({ members, vt }) => {
  const membersWithBirthday = members.filter((member) => member?.user?.birthyear)
  if (!membersWithBirthday.length) return null

  const values = membersWithBirthday
    .reduce(
      (acc, member) =>
        acc.map((item) =>
          item.key === getLabel(getAge(member?.user?.birthyear))
            ? { ...item, value: item.value + 1 }
            : item,
        ),
      AGE_KEYS.map((key) => ({ key, value: 0 })),
    )
    .map(getPercentString(membersWithBirthday.length))

  return (
    <div {...styles.chart}>
      <div style={{ marginBottom: 3 }}>
        <Label>{vt('vote/election/confirm/age/header')}</Label>
      </div>
      <Chart
        config={{
          type: 'Bar',
          numberFormat: '.0%',
          color: 'key',
          colorMap: AGES,
          colorSort: 'none',
          colorLegend: true,
          colorLegendValues: AGE_KEYS,
          domain: [0, 1],
          sort: 'none',
          inlineValue: true,
        }}
        values={values.filter((v) => v.value !== '0')}
      />
    </div>
  )
})

export const ElectionDiversity = ({
  title,
  members = [],
  text,
  isElected = true,
}) => (
  <div {...styles.container}>
    {title && (
      <Interaction.P>
        <strong>{title}</strong>
      </Interaction.P>
    )}
    <div {...styles.charts}>
      <MembersLocation members={members} isElected={isElected} />
      <MembersGender members={members} />
      <MembersAge members={members} />
    </div>
    {text && <P {...styles.text}>{text}</P>}
  </div>
)

const ElectionResultDiversity = ({ members, title, text }) => (
  <NarrowCard>
    <ElectionDiversity title={title} members={members} text={text} />
  </NarrowCard>
)

export default ElectionResultDiversity
