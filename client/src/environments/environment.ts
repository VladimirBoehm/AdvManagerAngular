export const environment = {
  apiUrl: determineApiUrl(),
};

function determineApiUrl(): string {
  const hostname = window.location.hostname;

  if (hostname === 'gray-coast-0eea7ee03.5.azurestaticapps.net') {
    return 'https://production-api-url.com/';
  } else {
    return 'https://ljscvw91-7117.euw.devtunnels.ms/';
  }
}
