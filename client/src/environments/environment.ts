export const environment = {
  apiUrl: determineApiUrl(),
};

function determineApiUrl(): string {
  const hostname = window.location.hostname;
  const developUrl = 'https://631h1jhw-7117.euw.devtunnels.ms/';

  if (hostname === 'gray-coast-0eea7ee03.5.azurestaticapps.net') {
    return 'https://chatcontrolwebapi.azurewebsites.net/';
  } else {
    return developUrl;
  }
}
