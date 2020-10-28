import { status } from './status'
import { response } from '../response'

test('sets given status code on the response', () => {
  const result = response(status(403))
  expect(result).toHaveProperty('status', 403)
  expect(result).toHaveProperty('statusText', 'Forbidden')
})

test('supports custom status text', () => {
  const result = response(status(301, 'Custom text'))
  expect(result).toHaveProperty('status', 301)
  expect(result).toHaveProperty('statusText', 'Custom text')
})
