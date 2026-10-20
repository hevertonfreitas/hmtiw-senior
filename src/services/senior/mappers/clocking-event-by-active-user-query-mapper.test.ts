import { mapClockingEventByActiveUserQuery } from './clocking-event-by-active-user-query-mapper'

describe('Senior response mapping', () => {
  it('preserves metadata and parses the event offset independently of the browser timezone', () => {
    const record = {
      id: 'example',
      dateEvent: '2026-10-20',
      timeEvent: '16:53:35',
      timeZone: '-03:00',
      appVersion: '5.2.2',
      platform: 'ios',
      origin: 'MOBILE',
      nsrNumber: 123,
      signatureStatus: 'CHECKED',
      employee: { timeTable: '08:00-12:00-14:00-18:00' },
      device: { name: 'iPhone', activations: [] },
      geolocation: { latitude: 0, longitude: 0 }
    }
    const [mapped] = mapClockingEventByActiveUserQuery({
      count: 1,
      totalPages: 1,
      result: [record]
    })
    expect(mapped).toMatchObject(record)
    expect(mapped.timestamp.toISOString()).toBe('2026-10-20T19:53:35.000Z')
  })

  it('orders by the actual instant and excludes invalid timestamps', () => {
    const result = [
      {
        id: 'late',
        dateEvent: '2026-10-20',
        timeEvent: '17:00:00',
        timeZone: '-03:00'
      },
      { id: 'bad', dateEvent: 'bad', timeEvent: 'bad' },
      {
        id: 'early',
        dateEvent: '2026-10-20',
        timeEvent: '08:00:00',
        timeZone: '-03:00'
      }
    ]
    expect(
      mapClockingEventByActiveUserQuery({
        count: 3,
        totalPages: 1,
        result
      }).map((event) => event.id)
    ).toEqual(['early', 'late'])
  })
})
