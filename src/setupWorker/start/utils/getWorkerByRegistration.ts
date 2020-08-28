import { ServiceWorkerMatcher } from '../../glossary'

/**
 * Attempts to resolve a Service Worker instance from a given registration,
 * regardless of its state (active, installing, waiting).
 */
export const getWorkerByRegistration = (
  registration: ServiceWorkerRegistration,
  absoluteWorkerUrl: string,
  serviceWorkerMatcher: ServiceWorkerMatcher,
): ServiceWorker | null => {
  const allStates = [
    registration.active,
    registration.installing,
    registration.waiting,
  ]
  const existingStates = allStates.filter(Boolean) as ServiceWorker[]
  const mockWorker = existingStates.find((worker) => {
    return serviceWorkerMatcher(worker.scriptURL, absoluteWorkerUrl)
  })

  return mockWorker || null
}
