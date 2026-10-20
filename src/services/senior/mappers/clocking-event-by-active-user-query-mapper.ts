import {
  AttendanceEvent,
  ClockingEventByActiveUserQueryResponse
} from '../dtos/clocking-event-by-active-user-query'

export const mapClockingEventByActiveUserQuery = (
  data: ClockingEventByActiveUserQueryResponse
): AttendanceEvent[] =>
  data.result
    .map((event) => ({
      ...event,
      timestamp: new Date(
        `${event.dateEvent}T${event.timeEvent}${event.timeZone || ''}`
      )
    }))
    .filter((event) => Number.isFinite(event.timestamp.getTime()))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
