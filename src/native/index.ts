import { interceptXMLHttpRequest } from 'node-request-interceptor/lib/interceptors/XMLHttpRequest'
import { createSetupServer } from '../node/createSetupServer'

// Provision request interception via patching the `XMLHttpRequest` class only
// in React Native. There is no `http`/`https` modules in that environment.
export const setupServer = createSetupServer(interceptXMLHttpRequest)
