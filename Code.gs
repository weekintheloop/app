/**
 * Code.gs
 * 
 * Projeto: Week In The Loop
 * Parte da Frota Educacional EC 115 Norte
 * 
 * Padrão FROTA:
 * - Conformidade 100% com diretrizes de governança
 * - Autenticação em texto plano (contexto supervisionado)
 * - Session gate para rotas protegidas
 * - Observabilidade e auditoria implementadas
 * 
 * @version 2.1
 * @date 2026-07-02
 */

﻿/**
 * @file Code.gs
 * @description Contém as funções principais para o roteamento de requisições HTTP (doGet, doPost) no Google Apps Script.
 *              Atua como o ponto de entrada da aplicação web, direcionando as requisições para os serviços apropriados.
 * @integration
 *   - `HtmlService.gs`: Utiliza funções para servir páginas HTML.
 *   - `AuthService.gs`: Pode invocar funções de autenticação para verificar sessões.
 *   - `ApiEndpoints.gs`: Roteia chamadas de API para funções específicas.
 */

function doGet(e) {
  // FLEET_FRAGMENT_BOOTSTRAP: o token fica no fragmento (#tok=), que não é
  // enviado ao servidor. O shell valida o token antes de chamar qualquer API.
  var fleetBootstrapPage = e && e.parameter && String(e.parameter.page || '') === 'app';
  var fleetBootstrapToken = e && e.parameter && (e.parameter.tok || e.parameter.token);
  if (fleetBootstrapPage && !fleetBootstrapToken) {
    var fleetTemplates = ['Index', 'index', 'Dashboard'];
    for (var fleetI = 0; fleetI < fleetTemplates.length; fleetI++) {
      try {
        var fleetTemplate = HtmlService.createTemplateFromFile(fleetTemplates[fleetI]);
        fleetTemplate.authToken = '';
        fleetTemplate.tok = '';
        fleetTemplate.sessionUser = {};
        fleetTemplate.data = { scriptUrl: ScriptApp.getService().getUrl() };
        return fleetTemplate.evaluate()
          .setTitle('Week In The Loop')
          .addMetaTag('viewport', 'width=device-width, initial-scale=1');
      } catch (fleetTemplateError) {
        // Template alternativo não disponível - fallback para mensagem genérica
      }
    }
    return HtmlService.createHtmlOutput('Aplicação indisponível.');
  }
  var params = e && e.parameter ? e.parameter : {};
  // O fluxo atual mantém o token no fragmento (#tok=) e o legado usa
  // ?token=. Quando o token chega ao servidor, ambos devem ser aceitos.
  var tok = params.tok || params.token || '';

  if (params.page === 'login' || !isAuthenticatedByToken(tok)) {
    return serveHtmlFile('Login');
  }

  var page = params.page || 'Index';
  if (page === 'app' || page === 'index') page = 'Index';
  return serveHtmlFile(page);
}

  // Se não autenticado, o fluxo continua normal

function doPost(e) {
  // Endpoint REST: aceita um corpo JSON { action, ... } e delega ao roteador de API
  // (handleApiRequest), devolvendo o mesmo envelope { success, data/error } do FrontendApi.
  try {
    var request = {};
    if (e && e.postData && e.postData.contents) {
      request = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      request = e.parameter;
    }
    var result = handleApiRequest(request);
        return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: String(err && err.message ? err.message : err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
