/**
 * @file OAuth2Service.gs
 * @description Fornece funcionalidades para integração com provedores de autenticação OAuth2 (ex: Google, Facebook).
 *              Permite que os usuários façam login usando suas contas existentes.
 * @integration
 *   - `AuthService.gs`: Pode ser usado como uma alternativa ou complemento à autenticação baseada em senha.
 *   - Bibliotecas externas: Pode requerer a biblioteca OAuth2 para Google Apps Script.
 */

function getOAuthService() {
  try {
    // A integração só é habilitada quando a biblioteca e as credenciais reais
    // estiverem configuradas nas propriedades do script.
    var props = PropertiesService.getScriptProperties();
    var clientId = props.getProperty('OAUTH_CLIENT_ID') || '';
    var clientSecret = props.getProperty('OAUTH_CLIENT_SECRET') || '';
    if (!clientId || !clientSecret || typeof OAuth2 === 'undefined') return null;
    return OAuth2.createService('Google')
      .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
      .setTokenUrl('https://accounts.google.com/o/oauth2/token')
      .setClientId(clientId)
      .setClientSecret(clientSecret)
      .setCallbackFunction('authCallback')
      .setPropertyStore(PropertiesService.getUserProperties())
      .setScope('email profile');
  } catch (error) {
    Logger.log("Erro em getOAuthService: " + error.message);
    throw error;
  }
}

function authCallback(request) {
  try {
    // Função de callback para o fluxo OAuth2
    // var service = getOAuthService();
    // var authorized = service.handleCallback(request);
    // if (authorized) { return HtmlService.createHtmlOutput('Success!'); }
    // else { return HtmlService.createHtmlOutput('Denied.'); }
    return HtmlService.createHtmlOutput('OAuth2 não configurado.');
  } catch (error) {
    Logger.log("Erro em authCallback: " + error.message);
    throw error;
  }
}
