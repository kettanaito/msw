const { msw } = MockServiceWorker

msw.get(
  'https://api.github.com/users/:username',
  (req, res, { status, set, json }) => {
    return res(
      status(301, 'Custom status text'),
      set({
        'Header-One': 'foo',
        'Header-Two': 'bar',
      }),
      json({
        message: 'This is not a GitHub API',
        username: req.params.username,
        req,
        headers: Array.from(req.headers.entries()),
      }),
    )
  },
)

msw.post('https://github.com/repo/:repoName', (req, res, { set, json }) => {
  return res(
    set('Custom-Header', 'value'),
    json({
      repository: req.params.repoName,
      message: 'This repo is amazing',
    }),
  )
})

msw.get(/api.website/, (req, res, { json }) => {
  return res(json({ message: 'Mocked using RegExp!' }))
})

msw.post('https://api.website.com', (req, res, { json, delay }) => {
  return res(delay(2000), json({ message: 'Delayed response message' }))
})

/* Start msw */
msw.start(navigator.serviceWorker.register('./mockServiceWorker.js'))
