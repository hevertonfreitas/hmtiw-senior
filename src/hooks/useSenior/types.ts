import { AttendanceEvent } from '../../services/senior/dtos/clocking-event-by-active-user-query'

export type WorkingHours = {
  hours: string
  minutes: string
  open: boolean
}

export type DailyData = {
  date: string
  day: number
  events: AttendanceEvent[]
  totalMinutes: number
  breakMinutes: number
  open: boolean
  isToday: boolean
  isFuture: boolean
  isWeekend: boolean
}
