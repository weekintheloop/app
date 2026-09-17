/**
 * @file UrlFetchService.gs
 * @description Encapsula o uso do serviço `UrlFetchApp` para fazer requisições HTTP/HTTPS externas.
 *              Permite que a aplicação interaja com APIs externas ou serviços web.
 * @integration
 *   - `WebHookService.gs`: Utiliza para enviar webhooks.
 *   - Outros serviços que precisam acessar recursos externos.
 */

function makeGetRequest(url, params) {
  try {
    var queryString = Object.keys(params).map(key => key + '=' + encodeURIComponent(params[key])).join('&');
    var fullUrl = url + (queryString ? '?' + queryString : '');
    try {
      var response = UrlFetchApp.fetch(fullUrl);
      logInfo("GET request para %s bem-sucedida.", fullUrl);
      return { success: true, content: response.getContentText(), responseCode: response.getResponseCode() };
    } catch (e) {
      logError("Falha na GET request para %s: %s", fullUrl, e.message);
      return { success: false, message: e.message };
    }
  } catch (error) {
    Logger.log("Erro em makeGetRequest: " + error.message);
    throw error;
  }
}

function makePostRequest(url, payload, contentType = 'application/json') {
  var options = {
    'method' : 'post',
    'contentType': contentType,
    'payload' : typeof payload === 'object' ? JSON.stringify(payload) : payload
  };
  try {
    var response = UrlFetchApp.fetch(url, options);
    logInfo("POST request para %s bem-sucedida.", url);
    return { success: true, content: response.getContentText(), responseCode: response.getResponseCode() };
  } catch (e) {
    logError("Falha na POST request para %s: %s", url, e.message);
    return { success: false, message: e.message };
  }
}
