import { DailyData } from '../../hooks/useSenior/types'
import { AttendanceEvent } from '../../services/senior/dtos/clocking-event-by-active-user-query'
import { workedMinutes } from '../hours'
import { twoDigits } from '../format'

export const DEFAULT_TARGET = 480
export const DEFAULT_TIMEZONE = 'America/Sao_Paulo'
export const BALANCE_TOLERANCE_MINUTES = 10

export const dateKey = (date: Date, timeZone = DEFAULT_TIMEZONE) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date)
  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value
  return `${value('year')}-${value('month')}-${value('day')}`
}

export const dateFromKey = (key: string) => new Date(`${key}T12:00:00`)

export const duration = (minutes: number) => {
  const absolute = Math.abs(Math.trunc(minutes))
  return `${twoDigits(Math.floor(absolute / 60))}:${twoDigits(absolute % 60)}`
}

export const signedDuration = (minutes: number) =>
  `${minutes < 0 ? '−' : minutes > 0 ? '+' : ''}${duration(minutes)}`

export const estimateExit = (events: AttendanceEvent[], target: number) => {
  if (!events.length || events.length % 2 === 0) return null
  const ordered = [...events].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  )
  let remaining = target * 60000
  for (let index = 0; index < ordered.length; index += 2) {
    const start = ordered[index].timestamp.getTime()
    const end = ordered[index + 1]?.timestamp.getTime()
    if (end === undefined || end - start >= remaining)
      return new Date(start + remaining)
    remaining -= end - start
  }
  return null
}

export const scheduleMinutes = (schedule?: string) => {
  if (!schedule) return null
  const times = schedule.match(/\b\d{2}:\d{2}\b/g)
  if (!times || times.length < 2 || times.length % 2 !== 0) return null
  const minutes = times.map((time) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours < 24 && minutes < 60 ? hours * 60 + minutes : NaN
  })
  if (minutes.some((value) => !Number.isFinite(value))) return null
  let total = 0
  for (let i = 0; i < minutes.length; i += 2) {
    const difference = minutes[i + 1] - minutes[i]
    if (difference === 0) return null
    total += difference > 0 ? difference : difference + 1440
  }
  return total > 0 && total <= 1440 ? total : null
}

export const buildDay = (
  date: string,
  events: AttendanceEvent[],
  now: Date,
  timeZone = DEFAULT_TIMEZONE
): DailyData => {
  const today = dateKey(now, timeZone)
  const ordered = [...events].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  )
  let breaks = 0
  for (let i = 1; i + 1 < ordered.length; i += 2) {
    breaks +=
      ordered[i + 1].timestamp.getTime() - ordered[i].timestamp.getTime()
  }
  return {
    date,
    day: Number(date.slice(-2)),
    events: ordered,
    totalMinutes: workedMinutes(
      ordered.map((event) => event.timestamp),
      date === today ? now : undefined
    ),
    breakMinutes: Math.floor(breaks / 60000),
    open: ordered.length % 2 !== 0,
    isToday: date === today,
    isFuture: date > today,
    isWeekend: [0, 6].includes(dateFromKey(date).getDay())
  }
}

export const monthEventsGroup = (
  events: AttendanceEvent[],
  year: number,
  now: Date,
  timeZone = DEFAULT_TIMEZONE
) => {
  const grouped = new Map<string, AttendanceEvent[]>()
  events.forEach((event) => {
    const group = grouped.get(event.dateEvent) ?? []
    group.push(event)
    grouped.set(event.dateEvent, group)
  })
  return Array.from({ length: 12 }, (_, month) =>
    Array.from(
      { length: new Date(year, month + 1, 0).getDate() },
      (_, index) => {
        const date = `${year}-${twoDigits(month + 1)}-${twoDigits(index + 1)}`
        return buildDay(date, grouped.get(date) ?? [], now, timeZone)
      }
    )
  )
}

/** Apply tolerance per weekday; differences beyond it count in full. */
export const dayBalance = (day: DailyData, target: number) => {
  if (!day.events.length || day.open || day.isFuture) return 0
  if (day.isWeekend) return day.totalMinutes
  const difference = day.totalMinutes - target
  return Math.abs(difference) <= BALANCE_TOLERANCE_MINUTES ? 0 : difference
}

export const dayStatus = (day: DailyData) => {
  if (!day.events.length) return day.isFuture ? 'Aguardando' : 'Sem registros'
  if (day.open) return day.isToday ? 'Em andamento' : 'Pendente'
  return 'Concluído'
}

export const originLabel = (event: AttendanceEvent) => {
  const origin = event.origin || event.platform
  const labels: Record<string, string> = {
    MOBILE: 'Aplicativo',
    WEB: 'Web',
    REP: 'Relógio de ponto',
    ios: 'Aplicativo iOS',
    android: 'Aplicativo Android'
  }
  return origin ? labels[origin] || origin : 'Origem não informada'
}

export const monthCsv = (days: DailyData[], target: number) => {
  const rows = [
    ['Data', 'Marcações', 'Horas trabalhadas', 'Saldo estimado', 'Situação'],
    ...days
      .filter((day) => day.events.length)
      .map((day) => [
        day.date,
        day.events.map((event) => event.timeEvent).join(' / '),
        duration(day.totalMinutes),
        day.open ? '' : signedDuration(dayBalance(day, target)),
        dayStatus(day)
      ])
  ]
  return (
    '\uFEFF' +
    rows
      .map((row) =>
        row.map((value) => `"${value.replace(/"/g, '""')}"`).join(';')
      )
      .join('\r\n')
  )
}

export const exportMonth = (
  days: DailyData[],
  target: number,
  name: string
) => {
  const csv = monthCsv(days, target)
  const url = URL.createObjectURL(
    new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  )
  const link = document.createElement('a')
  link.href = url
  link.download = `ponto-${name}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
