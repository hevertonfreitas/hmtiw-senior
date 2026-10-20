import { axiosSenior } from './axios-senior'
import { clockingEventByActiveUserQuery } from '.'

jest.mock('./axios-senior', () => ({ axiosSenior: { post: jest.fn() } }))
const post = axiosSenior.post as jest.Mock

afterEach(() => post.mockReset())

it('loads all pages, removes duplicate records and sorts timestamps', async () => {
  const early = {
    id: 'a',
    dateEvent: '2026-10-20',
    timeEvent: '08:00:00',
    timeZone: '-03:00'
  }
  const late = { ...early, id: 'b', timeEvent: '12:00:00' }
  post
    .mockResolvedValueOnce({
      data: { count: 2, totalPages: 2, result: [late] }
    })
    .mockResolvedValueOnce({
      data: { count: 2, totalPages: 2, result: [early, late] }
    })
  const events = await clockingEventByActiveUserQuery('test-token')
  expect(events.map((event) => event.id)).toEqual(['a', 'b'])
  expect(post).toHaveBeenCalledTimes(2)
  expect(post.mock.calls[1][1].filter.pageInfo.page).toBe(1)
  expect(post.mock.calls[0][2].headers.Authorization).toBe('bearer test-token')
})

it('propagates errors without returning a partial history', async () => {
  post
    .mockResolvedValueOnce({ data: { count: 2, totalPages: 2, result: [] } })
    .mockRejectedValueOnce(new Error('network unavailable'))
  await expect(clockingEventByActiveUserQuery('test-token')).rejects.toThrow(
    'network unavailable'
  )
})
