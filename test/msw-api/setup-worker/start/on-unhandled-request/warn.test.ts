import * as path from 'path'
import { pageWith } from 'page-with'

function createRuntime() {
  return pageWith({
    example: path.resolve(__dirname, 'warn.mocks.ts'),
  })
}

test('warns on an unhandled REST API request with an absolute URL', async () => {
  const { request, consoleSpy } = await createRuntime()
  const res = await request('https://mswjs.io/non-existing-page')
  const status = res.status()

  expect(status).toBe(404)

  const unhandledRequestWarning = consoleSpy.get('warning').find((text) => {
    return /\[MSW\] Warning: captured a request without a matching request handler/.test(
      text,
    )
  })

  expect(unhandledRequestWarning).toBeDefined()
})

test('warns on an unhandled REST API request with a relative URL', async () => {
  const { request, consoleSpy } = await createRuntime()
  const res = await request('/user-details')
  const status = res.status()

  expect(status).toBe(404)

  const unhandledRequestWarning = consoleSpy.get('warning').find((text) => {
    return /\[MSW\] Warning: captured a request without a matching request handler/.test(
      text,
    )
  })

  expect(unhandledRequestWarning).toBeDefined()
})

test('does not warn on request which handler explicitly returns no mocked response', async () => {
  const { request, consoleSpy } = await createRuntime()
  const res = await request('/explicit-return', { method: 'POST' })
  const status = res.status()

  expect(status).toBe(404)

  const unhandledRequestWarning = consoleSpy.get('warning').find((text) => {
    return /\[MSW\] Warning: captured a request without a matching request handler/.test(
      text,
    )
  })

  expect(unhandledRequestWarning).not.toBeDefined()
})

test('does not warn on request which handler implicitly returns no mocked response', async () => {
  const { request, consoleSpy } = await createRuntime()
  const res = await request('/implicit-return', { method: 'POST' })
  const status = res.status()

  expect(status).toBe(404)

  const unhandledRequestWarning = consoleSpy.get('warning').find((text) => {
    return /\[MSW\] Warning: captured a request without a matching request handler/.test(
      text,
    )
  })

  expect(unhandledRequestWarning).not.toBeDefined()
})
