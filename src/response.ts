import * as R from 'ramda'

export interface MockedResponse {
  body: any
  status: number
  statusText: string
  headers?: Headers
  delay: number
}

/**
 * @todo Use proper function signature.
 * (res: MockedResponse) => MockedResponse is the correct one, but
 * it doesn't seem to work properly with Radma's annotations.
 */
export type ResponseTransformer = (res: MockedResponse) => MockedResponse
export type ResponseComposition = (
  ...transformers: ResponseTransformer[]
) => MockedResponse

export const defaultResponse: MockedResponse = {
  status: 200,
  statusText: 'OK',
  body: null,
  delay: 0,
}

export const response: ResponseComposition = (...transformers) => {
  const headers = new Headers()
  headers.set('X-Powered-By', 'msw')

  const initialResponse = {
    ...defaultResponse,
    headers,
  }

  if (transformers && transformers.length > 0) {
    /**
     * Ignore the arity annotation from Ramda.
     * Apparently, TypeScript assumes "transformers" may be modified before
     * they get into pipe as arguments, thus screams at potentially empty array.
     */
    // @ts-ignore
    return R.pipe(...transformers)(initialResponse)
  }

  return initialResponse
}
