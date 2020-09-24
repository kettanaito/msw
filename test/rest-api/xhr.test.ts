import * as path from 'path'
import { runBrowserWith } from '../support/runBrowserWith'

test('mocks a response to an XMLHttpRequest', async () => {
  const runtime = await runBrowserWith(path.resolve(__dirname, 'xhr.mocks.ts'))

  const REQUEST_URL = 'https://api.github.com/users/octocat'
  runtime.page.evaluate((url) => {
    const req = new XMLHttpRequest()
    req.open('GET', url)
    req.send()
  }, REQUEST_URL)
  const res = await runtime.page.waitForResponse(REQUEST_URL)
  const body = await res.json()

  expect(res.status()).toBe(200)
  expect(body).toEqual({
    mocked: true,
  })

  return runtime.cleanup()
})
