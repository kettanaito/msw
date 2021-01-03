import * as cookieUtils from 'cookie'
import { bold } from 'chalk'
import { Headers, flattenHeadersObject } from 'headers-utils'
import {
  RequestInterceptor,
  MockedResponse as MockedInterceptedResponse,
  Interceptor,
} from 'node-request-interceptor'
import { RequestHandlersList } from '../setupWorker/glossary'
import { MockedRequest } from '../utils/handlers/requestHandler'
import { getResponse } from '../utils/getResponse'
import { parseBody } from '../utils/request/parseBody'
import { isNodeProcess } from '../utils/internal/isNodeProcess'
import * as requestHandlerUtils from '../utils/handlers/requestHandlerUtils'
import { onUnhandledRequest } from '../utils/request/onUnhandledRequest'
import { SetupServerApi } from './glossary'
import { SharedOptions } from '../sharedOptions'
import { uuidv4 } from '../utils/internal/uuidv4'

const DEFAULT_LISTEN_OPTIONS: SharedOptions = {
  onUnhandledRequest: 'bypass',
}

/**
 * Creates a `setupServer` API using given request interceptors.
 * Useful to generate identical API using different patches to request issuing modules.
 */
export function createSetupServer(...interceptors: Interceptor[]) {
  return function setupServer(
    ...requestHandlers: RequestHandlersList
  ): SetupServerApi {
    requestHandlers.forEach((handler) => {
      if (Array.isArray(handler))
        throw new Error(
          `[MSW] Failed to call "setupServer" given an Array of request handlers (setupServer([a, b])), expected to receive each handler individually: setupServer(a, b).`,
        )
    })
    const interceptor = new RequestInterceptor(interceptors)

    // Error when attempting to run this function in a browser environment.
    if (!isNodeProcess()) {
      throw new Error(
        '[MSW] Failed to execute `setupServer` in the environment that is not NodeJS (i.e. a browser). Consider using `setupWorker` instead.',
      )
    }

    // Store the list of request handlers for the current server instance,
    // so it could be modified at a runtime.
    let currentHandlers: RequestHandlersList = [...requestHandlers]

    return {
      listen(options) {
        const resolvedOptions = Object.assign(
          {},
          DEFAULT_LISTEN_OPTIONS,
          options,
        )

        interceptor.use(async (req) => {
          const requestHeaders = new Headers(
            flattenHeadersObject(req.headers || {}),
          )
          const requestCookieString = requestHeaders.get('cookie')

          const mockedRequest: MockedRequest = {
            id: uuidv4(),
            url: req.url,
            method: req.method,
            // Parse the request's body based on the "Content-Type" header.
            body: parseBody(req.body, requestHeaders),
            headers: requestHeaders,
            cookies: {},
            params: {},
            redirect: 'manual',
            referrer: '',
            keepalive: false,
            cache: 'default',
            mode: 'cors',
            referrerPolicy: 'no-referrer',
            integrity: '',
            destination: 'document',
            bodyUsed: false,
            credentials: 'same-origin',
          }

          if (requestCookieString) {
            // Set mocked request cookies from the `cookie` header of the original request.
            // No need to take `credentials` into account, because in NodeJS requests are intercepted
            // _after_ they happen. Request issuer should have already taken care of sending relevant cookies.
            // Unlike browser, where interception is on the worker level, _before_ the request happens.
            mockedRequest.cookies = cookieUtils.parse(requestCookieString)
          }

          if (mockedRequest.headers.get('x-msw-bypass')) {
            return
          }

          const { response } = await getResponse(mockedRequest, currentHandlers)

          if (!response) {
            onUnhandledRequest(
              mockedRequest,
              resolvedOptions.onUnhandledRequest,
            )
            return
          }

          return new Promise<MockedInterceptedResponse>((resolve) => {
            // the node build will use the timers module to ensure @sinon/fake-timers or jest fake timers
            // don't affect this timeout.
            setTimeout(() => {
              resolve({
                status: response.status,
                statusText: response.statusText,
                headers: response.headers.getAllHeaders(),
                body: response.body as string,
              })
            }, response.delay ?? 0)
          })
        })
      },

      use(...handlers) {
        requestHandlerUtils.use(currentHandlers, ...handlers)
      },

      restoreHandlers() {
        requestHandlerUtils.restoreHandlers(currentHandlers)
      },

      resetHandlers(...nextHandlers) {
        currentHandlers = requestHandlerUtils.resetHandlers(
          requestHandlers,
          ...nextHandlers,
        )
      },

      /**
       * Prints the list of currently active request handlers.
       */
      printHandlers() {
        currentHandlers.forEach((handler) => {
          const meta = handler.getMetaInfo()

          console.log(`\
${bold(meta.header)}
  Declaration: ${meta.callFrame}
`)
        })
      },

      /**
       * Stops requests interception by restoring all augmented modules.
       */
      close() {
        interceptor.restore()
      },
    }
  }
}
