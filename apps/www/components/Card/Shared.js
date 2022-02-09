import React from 'react'
import { css } from 'glamor'
import { sum, max } from 'd3-array'

import { Interaction } from '@project-r/styleguide'

import { Chart } from '@project-r/styleguide'

import withT from '../../lib/withT'
import { chfFormat } from '../../lib/utils/format'

const styles = {
  p: css(Interaction.fontRule, {
    margin: '0 0 5px',
    fontSize: 16,
    lineHeight: '22px',
    '& small': {
      display: 'block',
      fontSize: 14,
      lineHeight: '20px',
    },
  }),
  smallP: css(Interaction.fontRule, {
    margin: '0 0 5px',
    fontSize: 15,
    lineHeight: '22px',
    '& small': {
      display: 'block',
      fontSize: 10,
      lineHeight: '16px',
    },
  }),
  ul: css({
    margin: 0,
    marginTop: -3,
    paddingLeft: 20,
    fontSize: 15,
    lineHeight: '22px',
  }),
}

export const Paragraph = ({ children, style }) => (
  <p {...styles.p} style={style}>
    {children}
  </p>
)
export const SmallParagraph = ({ children, style }) => (
  <p {...styles.smallP} style={style}>
    {children}
  </p>
)
export const UL = ({ children, style }) => (
  <ul {...styles.ul} style={style}>
    {children}
  </ul>
)

const colorMap = {
  '1a': '#1f77b4',
  '1b': '#ff7f0e',
  '1c': '#2ca02c',
  '1cII': '#7f7f7f',
  '1d': '#d62728',
  '2a': '#8c564b',
  '2b': '#9467bd',
  '2c': '#bcbd22',
  '2d': '#d62728',
}

const FinanceFinancingAnswers = ({
  payload,
  payload: { financing },
  t,
  width,
}) => {
  const incomeDetail = ['1a', '1b', '1c', '1cII', '1d']
    .filter((key) => financing[key] && +financing[key].value)
    .map((key) => ({
      label:
        key === '1b' && financing['1bI'] && +financing['1bI'].value
          ? t.pluralize(`components/Card/financing/${key}`, {
              count: financing['1bI'].value,
            })
          : t(`components/Card/financing/${key}`),
      color: colorMap[key],
      value: financing[key].value,
    }))
  const incomeDetailTotal = sum(incomeDetail, (d) => +d.value)
  const incomeTotal =
    financing['1'] && max([+financing['1'].value, incomeDetailTotal])

  const expenseDetail = ['2a', '2b', '2c', '2d']
    .filter((key) => financing[key] && +financing[key].value)
    .map((key) => ({
      label: t(`components/Card/financing/${key}`),
      color: colorMap[key],
      value: financing[key].value,
    }))
  const expenseDetailTotal = sum(expenseDetail, (d) => +d.value)
  const expenseTotal =
    financing['2'] && max([+financing['2'].value, expenseDetailTotal])
  const total = max([incomeTotal, expenseTotal])

  return (
    <>
      <Paragraph>
        <strong>{t('components/Card/financing/title')}</strong>
      </Paragraph>
      <Paragraph>
        <strong>{t('components/Card/financing/1/title')}</strong>{' '}
        {incomeTotal ? chfFormat(incomeTotal) : t('components/Card/na')}
      </Paragraph>
      {incomeDetailTotal > 0 && (
        <Chart
          width={width}
          config={{
            type: 'Bar',
            barStyle: 'large',
            numberFormat: 's',
            colorLegend: true,
            domain: [0, total],
            color: 'label',
            colorSort: 'none',
            colorRange: incomeDetail.map((d) => d.color).concat('#ddd'),
            sort: 'none',
            xTicks: [],
          }}
          values={incomeDetail.concat(
            [
              incomeTotal > incomeDetailTotal && {
                label: t('components/Card/unidentified'),
                value: String(incomeTotal - incomeDetailTotal),
              },
            ].filter(Boolean),
          )}
        />
      )}
      {financing['1cI'] && financing['1cI'].value && (
        <Paragraph style={{ marginTop: 5 }}>
          {t('components/Card/financing/1cI/label')} {financing['1cI'].value}
          <br />
        </Paragraph>
      )}
      <Paragraph style={{ marginTop: 10 }}>
        <strong>{t('components/Card/financing/2/title')}</strong>{' '}
        {expenseTotal ? chfFormat(expenseTotal) : t('components/Card/na')}
      </Paragraph>
      {expenseDetailTotal > 0 && (
        <Chart
          width={width}
          config={{
            type: 'Bar',
            barStyle: 'large',
            numberFormat: 's',
            colorLegend: true,
            domain: [0, total],
            color: 'label',
            colorSort: 'none',
            colorRange: expenseDetail.map((d) => d.color).concat('#ddd'),
            sort: 'none',
            xTicks: [],
          }}
          values={expenseDetail.concat(
            [
              expenseTotal > expenseDetailTotal && {
                label: t('components/Card/unidentified'),
                value: String(expenseTotal - expenseDetailTotal),
              },
            ].filter(Boolean),
          )}
        />
      )}
      {financing['3'] && financing['3'].value && (
        <Paragraph style={{ marginTop: 10 }}>
          <strong>{t('components/Card/financing/3/title')}</strong>{' '}
          {financing['3'].value}
        </Paragraph>
      )}
      <Paragraph>
        <small style={{ marginTop: 10 }}>
          {t('components/Card/financing/source')}
        </small>
      </Paragraph>
    </>
  )
}

export const Finance = withT(({ payload, t, width }) => (
  <>
    {payload.financing && (
      <FinanceFinancingAnswers payload={payload} width={width} t={t} />
    )}
    {(!payload.financing ||
      !Object.keys(payload.financing).find(
        (key) => payload.financing[key] && payload.financing !== '0',
      )) && (
      <Paragraph>
        <strong>{t('components/Card/personalBudget')}</strong>
        {payload.campaignBudget
          ? ` ${chfFormat(payload.campaignBudget)}`
          : !payload.campaignBudgetComment && (
              <>
                <br />
                {t('components/Card/na')}
              </>
            )}
        {payload.campaignBudgetComment && (
          <>
            <br />
            {payload.campaignBudgetComment}
            <br />
          </>
        )}
      </Paragraph>
    )}
    <Paragraph>
      <strong>{t('components/Card/vestedInterests')}</strong>
      {!payload.vestedInterestsSmartvote.length && (
        <>
          <br />
          {t('components/Card/na')}
        </>
      )}
    </Paragraph>
    {!!payload.vestedInterestsSmartvote.length && (
      <UL>
        {payload.vestedInterestsSmartvote.map((vestedInterest, i) => (
          <li key={i}>
            {vestedInterest.name}
            {vestedInterest.entity ? ` (${vestedInterest.entity})` : ''}
            {vestedInterest.position ? `; ${vestedInterest.position}` : ''}
          </li>
        ))}
      </UL>
    )}
    <Paragraph>
      <small style={{ marginTop: 10 }}>
        {t('components/Card/sourceSmartvote')}
      </small>
    </Paragraph>
  </>
))
