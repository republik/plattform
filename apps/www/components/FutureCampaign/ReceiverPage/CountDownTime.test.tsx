import CountDownTime, {
  getCountDownString,
  getCountDownTime,
} from './CountdownTime'
import { render, cleanup, findByText } from '@testing-library/react'

describe('CountDownTime', () => {
  afterEach(cleanup)

  test('shold pluralize correctly', async () => {
    await assertCorrectCountDownString(
      '1 Tag 1 Stunde und 1 Minute',
      new Date('2 January, 2023 13:01:00 GMT+2'),
      new Date('1 January, 2023 12:00:00 GMT+2'),
    )

    await assertCorrectCountDownString(
      '2 Tage 2 Stunden und 2 Minuten',
      new Date('3 January, 2023 14:02:00 GMT+2'),
      new Date('1 January, 2023 12:00:00 GMT+2'),
    )

    await assertCorrectCountDownString(
      '2 Tage und 2 Stunden',
      new Date('3 January, 2023 14:00:00 GMT+2'),
      new Date('1 January, 2023 12:00:00 GMT+2'),
    )
  })

  test('should only show truthy unit', async () => {
    await assertCorrectCountDownString(
      '1 Tag',
      new Date('2 January, 2023 12:00:00 GMT+2'),
      new Date('1 January, 2023 12:00:00 GMT+2'),
    )
    await assertCorrectCountDownString(
      '2 Tage',
      new Date('3 January, 2023 12:00:00 GMT+2'),
      new Date('1 January, 2023 12:00:00 GMT+2'),
    )
    await assertCorrectCountDownString(
      '1 Stunde',
      new Date('1 January, 2023 13:00:00 GMT+2'),
      new Date('1 January, 2023 12:00:00 GMT+2'),
    )
    await assertCorrectCountDownString(
      '2 Stunden',
      new Date('1 January, 2023 14:00:00 GMT+2'),
      new Date('1 January, 2023 12:00:00 GMT+2'),
    )
    await assertCorrectCountDownString(
      '1 Minute',
      new Date('1 January, 2023 12:01:00 GMT+2'),
      new Date('1 January, 2023 12:00:00 GMT+2'),
    )
    await assertCorrectCountDownString(
      '2 Minuten',
      new Date('1 January, 2023 12:02:00 GMT+2'),
      new Date('1 January, 2023 12:00:00 GMT+2'),
    )
    await assertCorrectCountDownString(
      '1 Stunde',
      new Date('1 January, 2023 13:00:00 GMT+2'),
      new Date('1 January, 2023 12:00:00 GMT+2'),
    )
    await assertCorrectCountDownString(
      'weniger als eine Minute',
      new Date('1 January, 2023 12:00:30 GMT+2'),
      new Date('1 January, 2023 12:00:00 GMT+2'),
    )
  })

  test('should render correctly when having remaining days, hours and minutes', async () => {
    await assertCorrectCountDownString(
      '1 Tag 1 Stunde und 1 Minute',
      new Date('2 January, 2023 13:01:01 GMT+2'),
      new Date('1 January, 2023 12:00:00 GMT+2'),
    )
  })

  test('should render correctly when having remaining days and hours', async () => {
    await assertCorrectCountDownString(
      '1 Tag und 1 Stunde',
      new Date('2 January, 2023 13:00:00 GMT+2'),
      new Date('1 January, 2023 12:00:00 GMT+2'),
    )
    await assertCorrectCountDownString(
      '1 Tag und 2 Stunden',
      new Date('2 January, 2023 14:00:00 GMT+2'),
      new Date('1 January, 2023 12:00:00 GMT+2'),
    )
    await assertCorrectCountDownString(
      '2 Tage und 2 Stunden',
      new Date('3 January, 2023 14:00:00 GMT+2'),
      new Date('1 January, 2023 12:00:00 GMT+2'),
    )
  })

  test('should render correctly when having remaining days and minutes', async () => {
    await assertCorrectCountDownString(
      '1 Tag und 1 Minute',
      new Date('2 January, 2023 12:01:00 GMT+2'),
      new Date('1 January, 2023 12:00:00 GMT+2'),
    )
  })

  test('should render correctly when having remaining days and hours', async () => {
    await assertCorrectCountDownString(
      '1 Tag und 1 Stunde',
      new Date('2 January, 2023 13:00:00 GMT+2'),
      new Date('1 January, 2023 12:00:00 GMT+2'),
    )
  })

  test('should render correctly when having remaining hours and minutes', async () => {
    await assertCorrectCountDownString(
      '1 Stunde und 1 Minute',
      new Date('1 January, 2023 13:01:00 GMT+2'),
      new Date('1 January, 2023 12:00:00 GMT+2'),
    )
  })

  test('should render correctly when having remaining minutes', async () => {
    await assertCorrectCountDownString(
      '1 Minute',
      new Date('1 January, 2023 12:01:00 GMT+2'),
      new Date('1 January, 2023 12:00:00 GMT+2'),
    )
  })

  test('should call callback when countdown is over', async () => {
    const callback = jest.fn()
    render(
      <CountDownTime
        endDate={new Date('1 January, 2023 12:00:00 GMT+2')}
        startDate={new Date('1 January, 2023 12:00:00 GMT+2')}
        onCountDownReached={callback}
      />,
    )
    expect(callback).toBeCalled()
  })

  test('should not call callback when countdown is not over', async () => {
    const callback = jest.fn()
    render(
      <CountDownTime
        endDate={new Date('1 January, 2023 12:00:00 GMT+2')}
        startDate={new Date('1 January, 2023 11:59:59 GMT+2')}
        onCountDownReached={callback}
      />,
    )
    expect(callback).not.toBeCalled()
  })

  test('should render reached-element when countdown is over', async () => {
    const { getByText } = render(
      <CountDownTime
        endDate={new Date('1 January, 2023 12:00:00 GMT+2')}
        startDate={new Date('1 January, 2023 12:00:00 GMT+2')}
        reachedContent={<span>Reached</span>}
      />,
    )
    expect(getByText('Reached')).toBeVisible()
  })

  test('should not render reached-element when countdown is not over yet', async () => {
    const { queryByText } = render(
      <CountDownTime
        endDate={new Date('1 January, 2023 12:00:00 GMT+2')}
        startDate={new Date('1 January, 2023 11:59:59 GMT+2')}
        reachedContent={<span>Reached</span>}
      />,
    )

    const submitButton = queryByText('Reached')
    expect(submitButton).toBeNull()
  })
})

const assertCorrectCountDownString = async (
  expectedString: string,
  endDate: Date,
  startDate: Date,
) => {
  const acutalCountDownString = getCountDownString(
    getCountDownTime(endDate, startDate),
  )

  expect(acutalCountDownString).toBe(expectedString)
}
