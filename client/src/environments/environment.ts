const prodHostname = 'gray-coast-0eea7ee03.5.azurestaticapps.net';
const prodApi = 'https://chatcontrolwebapi.azurewebsites.net/';
//----------------------------------------------------------------
const testApi = 'https://t57m5x0f-7117.euw.devtunnels.ms/';

function determineApiUrl(): string {
  const hostname = window.location.hostname;
  if (hostname === prodHostname) {
    return prodApi;
  } else {
    return testApi;
  }
}

function isProd(): boolean {
  return window.location.hostname === prodHostname;
}

export const environment = {
  apiUrl: determineApiUrl(),
  isProd: isProd(),
};
