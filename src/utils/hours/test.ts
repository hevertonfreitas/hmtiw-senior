import { timeSpent, workedMinutes } from '.'

const at = (time: string) => new Date(`2026-10-20T${time}:00-03:00`)

describe('working time', () => {
  it('returns zero for an empty day', () => {
    expect(timeSpent([])).toEqual({ hours: '00', minutes: '00', open: false })
  })

  it('pairs events chronologically without mutating the original array', () => {
    const events = [at('12:00'), at('08:00'), at('18:00'), at('14:00')]
    const original = [...events]
    expect(timeSpent(events)).toEqual({
      hours: '08',
      minutes: '00',
      open: false
    })
    expect(events).toEqual(original)
  })

  it('adds live time only when the current instant is provided', () => {
    const events = [at('08:00'), at('12:00'), at('14:00')]
    expect(timeSpent(events, at('16:30'))).toEqual({
      hours: '06',
      minutes: '30',
      open: true
    })
    expect(events).toHaveLength(3)
    expect(workedMinutes(events)).toBe(240)
  })

  it('does not turn a past unmatched mark into hours through today', () => {
    expect(timeSpent([new Date('2022-05-08T04:15:00Z')])).toEqual({
      hours: '00',
      minutes: '00',
      open: true
    })
  })

  it('does not accrue negative time for a mark ahead of the current instant', () => {
    expect(workedMinutes([at('18:00')], at('17:00'))).toBe(0)
  })

  it('sums seconds across intervals before rounding to whole minutes', () => {
    const events = ['08:00:00', '08:00:45', '09:00:00', '09:00:45'].map(
      (time) => new Date(`2026-10-20T${time}-03:00`)
    )
    expect(workedMinutes(events)).toBe(1)
  })
})
