import { axiosSenior } from './axios-senior'
import {
  AttendanceEvent,
  ClockingEventByActiveUserQueryResponse
} from './dtos/clocking-event-by-active-user-query'
import { mapClockingEventByActiveUserQuery } from './mappers/clocking-event-by-active-user-query-mapper'

export const clockingEventByActiveUserQuery = async (token: string) => {
  const events: AttendanceEvent[] = []
  let page = 0
  let totalPages: number

  do {
    const { data } =
      await axiosSenior.post<ClockingEventByActiveUserQueryResponse>(
        't/senior.com.br/bridge/1.0/rest/hcm/pontomobile/queries/clockingEventByActiveUserQuery',
        {
          filter: {
            activePlatformUser: true,
            pageInfo: { page, pageSize: '731' },
            nameSearch: '',
            sort: { field: null, order: 'ASC' }
          }
        },
        { headers: { Authorization: 'bearer ' + token }, timeout: 30000 }
      )
    events.push(...mapClockingEventByActiveUserQuery(data))
    totalPages = data.totalPages
    page += 1
  } while (page < totalPages)

  return Array.from(
    new Map(events.map((event) => [event.id, event])).values()
  ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
}
