import { AttendanceEvent } from '../../services/senior/dtos/clocking-event-by-active-user-query'
import {
  buildDay,
  dateKey,
  dayBalance,
  dayStatus,
  duration,
  estimateExit,
  monthCsv,
  monthEventsGroup,
  scheduleMinutes,
  signedDuration
} from '.'

const now = new Date('2026-10-20T16:30:00-03:00')
const event = (date: string, time: string): AttendanceEvent => ({
  id: `${date}-${time}`,
  dateEvent: date,
  timeEvent: time,
  timestamp: new Date(`${date}T${time}-03:00`)
})
const dayEvents = (date: string, times: string[]) =>
  times.map((time) => event(date, time))

describe('attendance summaries', () => {
  it('extracts the work target from the API schedule, excluding breaks', () => {
    expect(scheduleMinutes('08:00-12:00-14:00-18:00')).toBe(480)
    expect(scheduleMinutes('22:00-06:00')).toBe(480)
    expect(scheduleMinutes('09:00-12:00-13:00-17:30')).toBe(450)
  })

  it.each([
    undefined,
    '',
    'Geral',
    '08:00-12:00-14:00',
    '24:00-25:00',
    '08:75-12:00'
  ])('rejects incomplete or invalid schedules: %s', (value) => {
    expect(scheduleMinutes(value)).toBeNull()
  })

  it('uses the company timezone when resolving the current day', () => {
    const instant = new Date('2026-10-21T01:30:00Z')
    expect(dateKey(instant, 'America/Sao_Paulo')).toBe('2026-10-20')
    expect(dateKey(instant, 'Asia/Tokyo')).toBe('2026-10-21')
  })

  it('calculates breaks and live working time for today', () => {
    const day = buildDay(
      '2026-10-20',
      dayEvents('2026-10-20', ['08:00:00', '12:00:00', '14:00:00']),
      now
    )
    expect(day.totalMinutes).toBe(390)
    expect(day.breakMinutes).toBe(120)
    expect(dayStatus(day)).toBe('Em andamento')
    expect(dayBalance(day, 480)).toBe(0)
  })

  it('keeps only completed pairs for past pending days', () => {
    const day = buildDay(
      '2026-10-19',
      dayEvents('2026-10-19', ['08:00:00', '12:00:00', '14:00:00']),
      now
    )
    expect(day.totalMinutes).toBe(240)
    expect(dayStatus(day)).toBe('Pendente')
    expect(dayBalance(day, 480)).toBe(0)
  })

  it('never invents days at the end of short months', () => {
    expect(monthEventsGroup([], 2026, now)[1]).toHaveLength(28)
    expect(monthEventsGroup([], 2024, now)[1]).toHaveLength(29)
    expect(monthEventsGroup([], 2026, now)[3]).toHaveLength(30)
  })

  it('groups by the recorded date even when the instant falls on another UTC day', () => {
    const mark = event('2026-10-19', '23:30:00')
    const months = monthEventsGroup([mark], 2026, now)
    expect(months[9][18].events).toEqual([mark])
    expect(months[9][19].events).toHaveLength(0)
  })

  it('calculates exact positive and negative balances and weekend overtime', () => {
    const complete = (date: string, end: string) =>
      buildDay(date, dayEvents(date, ['08:00:00', end]), now)
    expect(dayBalance(complete('2026-10-19', '15:00:00'), 480)).toBe(-60)
    expect(dayBalance(complete('2026-10-19', '16:15:00'), 480)).toBe(15)
    expect(dayBalance(complete('2026-10-18', '10:00:00'), 480)).toBe(120)
    expect(dayBalance(buildDay('2026-10-19', [], now), 480)).toBe(0)
    expect(dayBalance(complete('2026-10-21', '16:00:00'), 480)).toBe(0)
  })

  it.each([
    ['15:49:00', -11],
    ['15:50:00', 0],
    ['15:59:00', 0],
    ['16:00:00', 0],
    ['16:01:00', 0],
    ['16:10:00', 0],
    ['16:11:00', 11]
  ])(
    'applies the inclusive daily tolerance for an exit at %s',
    (end, balance) => {
      const day = buildDay(
        '2026-10-19',
        dayEvents('2026-10-19', ['08:00:00', end]),
        now
      )
      expect(dayBalance(day, 480)).toBe(balance)
    }
  )

  it.each([
    ['15:20:00', 0],
    ['15:41:00', 11]
  ])(
    'applies tolerance relative to a custom target for an exit at %s',
    (end, balance) => {
      const day = buildDay(
        '2026-10-19',
        dayEvents('2026-10-19', ['08:00:00', end]),
        now
      )
      expect(dayBalance(day, 450)).toBe(balance)
    }
  )

  it.each(['2026-10-17', '2026-10-18'])(
    'preserves all weekend overtime on %s even within ten minutes',
    (date) => {
      const day = buildDay(date, dayEvents(date, ['08:00:00', '08:05:00']), now)
      expect(dayBalance(day, 480)).toBe(5)
    }
  )

  it('applies tolerance to the daily total rather than each working interval', () => {
    const day = buildDay(
      '2026-10-19',
      dayEvents('2026-10-19', ['08:00:00', '11:54:00', '13:00:00', '16:55:00']),
      now
    )
    expect(dayBalance(day, 480)).toBe(-11)
  })

  it('applies tolerance per day before summing the monthly balance', () => {
    const events = [
      ...dayEvents('2026-10-14', ['08:00:00', '16:10:00']),
      ...dayEvents('2026-10-15', ['08:00:00', '16:10:00']),
      ...dayEvents('2026-10-16', ['08:00:00', '15:49:00'])
    ]
    const october = monthEventsGroup(events, 2026, now)[9]
    expect(
      october.reduce((total, day) => total + dayBalance(day, 480), 0)
    ).toBe(-11)
  })

  it('formats durations beyond a single day and small negative balances correctly', () => {
    expect(duration(1505)).toBe('25:05')
    expect(signedDuration(-5)).toBe('−00:05')
    expect(signedDuration(60)).toBe('+01:00')
    expect(signedDuration(0)).toBe('00:00')
  })
})

describe('exit estimates', () => {
  it('uses exact seconds and completed intervals without drift as the clock ticks', () => {
    const events = dayEvents('2026-10-20', ['08:00:35', '12:00:00', '14:00:00'])
    expect(estimateExit(events, 480)?.toISOString()).toBe(
      '2026-10-20T21:00:35.000Z'
    )
  })

  it('retains the next day when a target crosses midnight', () => {
    expect(
      estimateExit(dayEvents('2026-10-20', ['16:53:35']), 480)?.toISOString()
    ).toBe('2026-10-21T03:53:35.000Z')
  })

  it('returns the instant the goal was reached even after a new interval starts', () => {
    const events = dayEvents('2026-10-20', ['08:00:00', '12:00:00', '14:00:00'])
    expect(estimateExit(events, 180)?.toISOString()).toBe(
      '2026-10-20T14:00:00.000Z'
    )
    expect(estimateExit(events.slice(0, 2), 480)).toBeNull()
  })
})

describe('CSV reports', () => {
  it.each([
    ['15:50:00', '07:50', '00:00'],
    ['16:10:00', '08:10', '00:00'],
    ['15:49:00', '07:49', '−00:11'],
    ['16:11:00', '08:11', '+00:11']
  ])(
    'exports the tolerated balance and actual hours for an exit at %s',
    (end, hours, balance) => {
      const day = buildDay(
        '2026-10-19',
        dayEvents('2026-10-19', ['08:00:00', end]),
        now
      )
      expect(monthCsv([day], 480)).toContain(
        `"2026-10-19";"08:00:00 / ${end}";"${hours}";"${balance}";"Concluído"`
      )
      expect(duration(day.totalMinutes)).toBe(hours)
    }
  )

  it('exports recorded days and partial totals while leaving pending balances blank', () => {
    const complete = buildDay(
      '2026-10-19',
      dayEvents('2026-10-19', ['08:00:00', '15:00:00']),
      now
    )
    const pending = buildDay(
      '2026-10-16',
      dayEvents('2026-10-16', ['08:00:00', '12:00:00', '14:00:00']),
      now
    )
    const empty = buildDay('2026-10-18', [], now)
    const csv = monthCsv([complete, pending, empty], 480)
    expect(csv.charCodeAt(0)).toBe(0xfeff)
    expect(csv).toContain(
      '"2026-10-19";"08:00:00 / 15:00:00";"07:00";"−01:00";"Concluído"'
    )
    expect(csv).toContain(
      '"2026-10-16";"08:00:00 / 12:00:00 / 14:00:00";"04:00";"";"Pendente"'
    )
    expect(csv).not.toContain('2026-10-18')
  })
})
