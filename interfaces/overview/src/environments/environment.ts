// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  // APIs
  api_url: '',

  // Feature-flags:
  useMockData: false,
  useServiceWorker: false,

  // Configuration/initial data:
  defaultCountryCode: 'ZMB',
  initialLat: -12.823,
  initialLng: 29.268,
};
