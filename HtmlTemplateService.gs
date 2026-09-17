/**
 * @file HtmlTemplateService.gs
 * @description Extende o `HtmlService.gs` para gerenciar templates HTML de forma mais avançada, permitindo a inclusão de dados dinâmicos e a renderização de fragmentos de UI.
 *              Facilita a construção de interfaces complexas e reutilizáveis.
 * @integration
 *   - `HtmlService.gs`: Utiliza as funções básicas de serviço HTML.
 *   - Componentes `.html`: Carrega e renderiza os templates.
 */

function renderTemplate(templateName, data = {}) {
  try {
    // Renderiza um template HTML com os dados fornecidos.
    // Os dados são passados para o template e podem ser acessados via `<% %>`.
    var template = HtmlService.createTemplateFromFile(templateName);
    template.data = data;
    return template.evaluate().getContent();
  } catch (error) {
    Logger.log("Erro em renderTemplate: " + error.message);
    throw error;
  }
}

function renderPartial(partialName, data = {}) {
  try {
    // Renderiza um fragmento HTML (partial) com os dados fornecidos.
    // Útil para componentes de UI reutilizáveis.
    var template = HtmlService.createTemplateFromFile(partialName);
    template.data = data;
    return template.evaluate().getContent();
  } catch (error) {
    Logger.log("Erro em renderPartial: " + error.message);
    throw error;
  }
}

function includeCss(filename) {
  try {
    // Inclui um arquivo CSS no template HTML.
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    Logger.log("Erro em includeCss: " + error.message);
    throw error;
  }
}

function includeJs(filename) {
  try {
    // Inclui um arquivo JavaScript no template HTML.
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    Logger.log("Erro em includeJs: " + error.message);
    throw error;
  }
}
