import { data } from './data'
import { errors } from './errors'
import { response } from '../response'

describe('data', () => {
  describe('given a JSON data', () => {
    let result: ReturnType<typeof response>

    beforeAll(() => {
      result = response(data({ name: 'msw' }))
    })

    it('should have "Content-Type" as "application/json"', () => {
      expect(result.headers.get('content-type')).toEqual('application/json')
    })

    it('should have body set to the given JSON nested in the "data" property', () => {
      expect(result).toHaveProperty('body', `{"data":{"name":"msw"}}`)
    })
  })
  describe('given composed with error', () => {
    let result: ReturnType<typeof response>

    beforeAll(() => {
      result = response(
        data({ name: 'msw' }),
        errors([{ message: 'is great' }]),
      )
    })

    it('should have body set to the given JSON nested in the "data" property', () => {
      expect(result).toHaveProperty(
        'body',
        `{\"errors\":[{\"message\":\"is great\"}],\"data\":{\"name\":\"msw\"}}`,
      )
    })
  })
})
