import { WorkingHours } from '../../hooks/useSenior/types'
import { twoDigits } from '../format'

/** An unmatched mark only accrues time with an explicit current instant. */
export const workedMinutes = (events: Date[], currentDate?: Date) => {
  const ordered = [...events].sort((a, b) => a.getTime() - b.getTime())
  let milliseconds = 0

  for (let i = 0; i < ordered.length; i += 2) {
    const end = ordered[i + 1] ?? currentDate
    if (end) milliseconds += Math.max(0, end.getTime() - ordered[i].getTime())
  }

  return Math.floor(milliseconds / 60000)
}

export const timeSpent = (events: Date[], currentDate?: Date): WorkingHours => {
  const total = workedMinutes(events, currentDate)
  return {
    hours: twoDigits(Math.floor(total / 60)),
    minutes: twoDigits(total % 60),
    open: events.length % 2 !== 0
  }
}
