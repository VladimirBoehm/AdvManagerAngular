export const environment = {
  apiUrl: determineApiUrl(),
};

function determineApiUrl(): string {
  const hostname = window.location.hostname;
  const developUrl =
    'https://c181-2001-16b8-a09e-6a00-fdad-b177-28f8-f076.ngrok-free.app/';

  if (hostname === 'gray-coast-0eea7ee03.5.azurestaticapps.net') {
    return 'https://chatcontrolwebapi.azurewebsites.net/';
  } else {
    return developUrl;
  }
}
