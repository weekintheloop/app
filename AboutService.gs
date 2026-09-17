/**
 * @file AboutService.gs
 * @description Fornece informações sobre a aplicação, como versão, autor e descrição.
 *              Pode ser exibido em uma página "Sobre" ou em um rodapé.
 * @integration
 *   - `HtmlService.gs`: Pode ser usado para servir a página "Sobre".
 */

function getAppInfo() {
  // Retorna um objeto com informações sobre a aplicação
  return {
    name: "Week In The Loop",
    version: "1.0.0",
    author: "Equipe do Week In The Loop",
    description: "Acompanhamento semanal e rotina pedagógica da Escola Classe 115 Norte.",
    lastUpdated: new Date()
  };
}

function serveAboutPage() {
  try {
    // Serve uma página HTML com as informações "Sobre"
    var appInfo = getAppInfo();
    var template = HtmlService.createTemplateFromFile("About");
    template.appInfo = appInfo;
    return template.evaluate();
  } catch (error) {
    Logger.log("Erro em serveAboutPage: " + error.message);
    throw error;
  }
}
