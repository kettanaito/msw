import * as path from 'path'
import { TestAPI, runBrowserWith } from '../../../support/runBrowserWith'
import { captureConsole } from '../../../support/captureConsole'

let runtime: TestAPI

beforeAll(async () => {
  runtime = await runBrowserWith(path.resolve(__dirname, 'start.mocks.ts'))
})

afterAll(() => {
  return runtime.cleanup()
})

test('resolves the "start" Promise after the worker has been activated', async () => {
  const resolvedPayload = await runtime.page.evaluate(() => {
    // @ts-ignore
    return window.__MSW_REGISTRATION__
  })

  expect(resolvedPayload).toBe('ServiceWorkerRegistration')

  const { messages } = captureConsole(runtime.page)

  await runtime.reload()

  const activationMessageIndex = messages.startGroupCollapsed.findIndex(
    (text) => {
      return text.includes('[MSW] Mocking enabled')
    },
  )

  const customMessageIndex = messages.log.findIndex((text) => {
    return text.includes('Registration Promise resolved')
  })

  expect(activationMessageIndex).toBeGreaterThan(-1)
  expect(customMessageIndex).toBeGreaterThan(-1)
  expect(customMessageIndex).toBeGreaterThan(activationMessageIndex)
})
