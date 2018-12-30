<h1 align="center">MSW</h1>

<p align="center">Serverless offline client-side API mocking for your applications.</p>

## Features

- **Serverless**. Doesn't establish any servers, lives entirely in a browser;
- **Deviation-free**. Request the same resources you would in production, and let MSW handle the mocking of the respective responses;
- **Mocking as a tool**. Enable/disable/change mocking logic on runtime instantly without any compilations or rebuilds. Control the MSW lifecycle from your browser's DevTools.
- **Essentials**. Emulate status codes, headers, cookies, delays, and more.

## Motivation

There are several points that I find annoying when conducting API mocking with any solution I've found:

- Often relies on a mocking server which you need to run and maintain;
- Doesn't really mock requests, rather _replaces_ their urls to point to a mocking server, instead of a real server;
- Brings extra dependencies to your application, instead of being a simple dependency-free development tool.

This library aims to eradicate those problems, as it takes an entirely different approach to the client-side API mocking.

## Getting started

### 1. Install

```bash
npm install msw --dev
```

### 2. Configure

Run the following command in your project's root directory:

```bash
msw create <rootDir>
```

> Replace `rootDir` with the relative path to your server's root directory (i.e. `msw create public`).

This is going to copy the Mock Service Worker to the specified directory, so it could be served as a static file from your server. This makes it possible to be registered from the client application.

### 3. Use

```js
// app/mocks.js
import { msw } from 'msw'

/* Configure mocking routes */
msw.get(
  'https://api.github.com/repo/:repoName',
  (req, res, { status, set, delay, json }) => {
    const { repoName } = req.params // access request's params

    return res(
      status(403), // set custom status
      set({ 'Custom-Header': 'foo' }), // set headers
      delay(1000), // delay the response
      json({ errorMessage: `Repository "${repoName}" not found` }),
    )
)

/* Start the Mock Service Worker */
msw.start()
```

Import your `mocks.js` module anywhere in the root of your application to enable the mocking:

```js
// app/index.js
import './mocks.js'
```

## Update on reload

Service Workers are designed as a caching tool. However, we don't want our mocking definitions to be cached, which may result into out-of-date logic during development.

It's highly recommend to **enable "Update on reload"** option in the "Application" tab of Chrome's DevTools (under "Service Workers" section). This will force Service Worker to update on each page reload, ensuring the latest logic is applied.

![Service Workers: Update on reload](./media/sw-update-on-reload.png)

> Read more on [The Service Worker Lifecycle](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle).

## How does it work?

MSW uses Service Worker API with its primary ability to intercept requests, only instead of caching their responses it immitates them. In a nutshell, it works as follows:

1. MSW spawns a dedicated Service Worker and creates a communication channel between the worker and the client.
1. Service Worker then signals any outgoing requests on the page to the MSW, which attempts to match them against the defined mocking routes.
1. When any match occurs, the `resolver` function is executed, and its payload is returned as the mocked response.

## Browser support

This library is meant to be used for **development only**. It doesn't require, nor encourage to install any Service Worker on the production environment.

> [**See browser support for ServiceWorkers**](https://caniuse.com/#feat=serviceworkers)
