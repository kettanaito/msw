<p align="center">
  <a href="https://www.npmjs.com/package/msw" target="_blank">
    <img src="https://img.shields.io/npm/v/msw.svg" alt="Package version" />
  </a>
  <a href="https://circleci.com/gh/open-draft/msw)" target="_blank">
    <img src="https://img.shields.io/circleci/project/github/open-draft/msw/master.svg" alt="Build status" />
  </a>
  <a href="https://david-dm.org/open-draft/msw" target="_blank">
    <img src="https://img.shields.io/david/open-draft/msw.svg" alt="Dependencies status" />
  </a>
  <a href="https://david-dm.org/open-draft/msw?type=dev" target="_blank">
    <img src="https://img.shields.io/david/dev/open-draft/msw.svg" alt="Dev dependencies status" />
  </a>
</p>

<h1 align="center">MSW</h1>

<p align="center">Serverless runtime client-side API mocking for your applications.</p>

## Features

- **Serverless**. Doesn't establish any servers, lives entirely in a browser;
- **Deviation-free**. Request the very same resources (urls) you would in production, and let MSW handle the mocking of the respective responses;
- **Mocking as a tool**. Enable/disable/change mocking logic on runtime instantly without any compilations or rebuilds. Control the MSW lifecycle from your browser's DevTools;
- **Essentials**. Emulate status codes, headers, delays, and create custom response mocking functions.

## Motivation

There are several points that I find annoying when conducting API mocking with any solution I've found:

- Often relies on a separate mocking server which you need to run and maintain;
- Doesn't really mock requests, rather _replaces_ their urls to point to a mocking server, instead of a real server;
- Brings extra dependencies to your application, instead of being a simple dependency-free development tool.

This library annihilates those problems, as it takes an entirely different approach to the client-side API mocking.

## Getting started

### 1. Install

```bash
npm install msw --save
```

### 2. Configure

Run the following command in your project's public directory:

```bash
node_modules/.bin/msw init <publicDir>
```

> Replace `publicDir` with the relative path to your server's public directory (i.e. `msw init public`).

This copies the Mock Service Worker file to the specified `publicDir`, so it's served as a static asset by your server. This way browser can access and register the mock service worker module.

#### Where is my "public" directory?

This is usually a build directory of your application (`build/`, `public/` or `dest/`). This directory is often _committed to Git_, so should be the Mock Service Worker. You can also integrate service worker generation as a part of your build step.

### 3. Define mocks

First, create a mocking definition file:

```js
// app/mocks.js
import { composeMocks, rest } from 'msw'

// Configure mocking routes
const { start } = composeMocks(
  rest.get('https://api.github.com/repo/:repoName',
  (req, res, { status, set, delay, json }) => {
    // access request's params
    const { repoName } = req.params

    return res(
      // set custom status
      status(403),
      // set headers
      set({ 'Custom-Header': 'foo' }),
      // delay the response
      delay(1000),
      // send JSON response body
      json({ errorMessage: `Repository "${repoName}" not found` }),
    )
  )
)

/* Start the Service Worker */
start()
```

> Mocks structure if up to you, but be sure to call `start()` **only once!**

### 4. Integrate

Mocking is a **development-only** procedure. It's highly recommended to include your mocking module (i.e. `app/mocks.js`) into your application's entry during the build. See the examples below.

#### Use webpack

```js
// ./webpack.config.js
const __DEV__ = process.env.NODE_ENV === 'development'

module.exports = {
  entry: [
    // Include mocks when in development
    __DEV__ && 'app/mocks.js',

    // Include your application's entry
    'app/index.js',
  ].filter(Boolean),

  // Rest of your config here
  ...webpackConfig,
}
```

#### Use conditional require

Alternatively, you can require mocking file(s) conditionally in your client bundle.

```js
// app/index.js
if (process.env.NODE_ENV === 'development') {
  require('./mocks.js')
}
```

## Update on reload

Service Workers are designed as a caching tool. However, we don't want our mocking definitions to be cached since that would result into out-of-date logic during development.

It's highly recommend to **enable "Update on reload"** option in your browser (DevTools > Application > Service Workers, in Chrome). This will force Service Worker to update on each page reload, ensuring the latest logic is applied.

![Service Workers: Update on reload](https://raw.githubusercontent.com/open-draft/msw/master/media/sw-update-on-reload.png)

> Read more about the [Service Worker Lifecycle](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle).

## How does it work?

MSW (_Mock Service Worker_) uses Service Worker API with its primary ability to intercept requests, but instead of caching responses it imitates them according to the provided mock definitions. Here's a simplified internal flow:

1. MSW spawns a dedicated Service Worker and creates a communication channel between the worker and the client.
1. Service Worker then signals any outgoing requests on the page to the MSW, which attempts to match them against the defined mocking routes.
1. When any match occurs, the `resolver` function is executed, and its payload is returned as the mocked response.

## Browser support

This library is meant to be used for **development only**. It doesn't require, nor encourage you to install any Service Worker on production environment.

> [**See browser support for ServiceWorkers**](https://caniuse.com/#feat=serviceworkers)

## Contribute

Have an idea? Found a bug? Please communicate it through using the [issues](https://github.com/open-draft/msw/issues) tab of this repository. [Pull requests](https://github.com/open-draft/msw/pulls) are welcome as well!
