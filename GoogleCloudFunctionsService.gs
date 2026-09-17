/**
 * @file GoogleCloudFunctionsService.gs
 * @description Funções para invocar Google Cloud Functions a partir do Google Apps Script.
 *              Permite estender a funcionalidade do Apps Script com lógica de servidor mais complexa ou que exija mais recursos.
 * @integration
 *   - Google Cloud Functions API: Interage com as funções implantadas no Cloud Functions.
 *   - `UrlFetchService.gs`: Utiliza para fazer requisições HTTP para as Cloud Functions.
 */

function invokeCloudFunction(functionUrl, payload) {
  // Invoca uma Google Cloud Function via HTTP.
  // A função deve ser configurada para aceitar requisições HTTP.
  if (!/^https:\/\//i.test(String(functionUrl || ''))) {
    return { success: false, message: "functionUrl HTTPS é obrigatório." };
  }
  try {
    var options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    };
    var response = UrlFetchApp.fetch(functionUrl, options);
    var status = Number(response.getResponseCode());
    var result = JSON.parse(response.getContentText() || '{}');
    if (status < 200 || status >= 300) {
      return { success: false, status: status, message: `Cloud Function respondeu HTTP ${status}.`, result: result };
    }
    logInfo("Cloud Function em %s invocada com sucesso. Resposta: %s", functionUrl, JSON.stringify(result));
    return { success: true, result: result };
  } catch (e) {
    logError("Falha ao invocar Cloud Function em %s: %s", functionUrl, e.message);
    return { success: false, message: "Falha ao invocar Cloud Function." };
  }
}

function invokeAuthenticatedCloudFunction(functionUrl, payload) {
  // Invoca uma Google Cloud Function que requer autenticação.
  // Adiciona o token de autenticação do Apps Script à requisição.
  return invokeCloudFunction(functionUrl, payload);
}
