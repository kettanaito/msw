import { json } from './json'
import { response } from '../response'

test('sets response content type and body to the given JSON', () => {
  const result = response(json({ firstName: 'John' }))
  expect(result.headers.get('content-type')).toEqual('application/json')
  expect(result).toHaveProperty('body', `{"firstName":"John"}`)
})

test('sets given Array as the response JSOn body', () => {
  const result = response(json([1, '2', true, { ok: true }, '']))
  expect(result).toHaveProperty('body', `[1,"2",true,{"ok":true},""]`)
})

test('sets given string as the response JSON body', () => {
  const result = response(json('some string'))
  expect(result).toHaveProperty('body', `"some string"`)
})

test('sets given boolean as the response JSON body', () => {
  const result = response(json(true))
  expect(result).toHaveProperty('body', `true`)
})

test('sets given date as the response JSON body', () => {
  const result = response(json(new Date(Date.UTC(2020, 0, 1))))
  expect(result).toHaveProperty('body', `"2020-01-01T00:00:00.000Z"`)
})

test('merges with an existing JSON body (shallow)', () => {
  const result = response(
    json({ firstName: 'John' }, { merge: true }),
    json({ lastName: 'Maverick' }, { merge: true }),
  )

  expect(result).toHaveProperty(
    'body',
    `{"lastName":"Maverick","firstName":"John"}`,
  )
})

test('merges with an existing JSON body (deep)', () => {
  const result = response(
    json(
      {
        firstName: 'John',
        address: {
          street: 'Sunwell Ave.',
          houseNumber: 12,
        },
      },
      { merge: true },
    ),
    json(
      {
        lastName: 'Maverick',
      },
      { merge: true },
    ),
  )

  expect(result).toHaveProperty(
    'body',
    `{"lastName":"Maverick","firstName":"John","address":{"street":"Sunwell Ave.","houseNumber":12}}`,
  )
})
