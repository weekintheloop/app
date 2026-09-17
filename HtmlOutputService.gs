/**
 * @file HtmlOutputService.gs
 * @description Gerencia a criação e sanitização de objetos HtmlOutput antes de serem enviados ao cliente.
 *              Garante que o HTML gerado seja seguro e bem formatado.
 * @integration
 *   - `HtmlService.gs`: Utiliza para criar o HtmlOutput.
 *   - `HtmlSanitizer.gs`: Utiliza para sanitizar o conteúdo HTML.
 */

function createSafeHtmlOutput(htmlContent) {
  try {
    // Cria um HtmlOutput a partir de uma string HTML, aplicando sanitização.
    var sanitizedHtml = HtmlSanitizer.sanitizeHtml(htmlContent);
    return HtmlService.createHtmlOutput(sanitizedHtml);
  } catch (error) {
    Logger.log("Erro em createSafeHtmlOutput: " + error.message);
    throw error;
  }
}

function createTemplateHtmlOutput(templateName, data = {}) {
  try {
    // Cria um HtmlOutput a partir de um template, passando dados e aplicando sanitização.
    var template = HtmlService.createTemplateFromFile(templateName);
    template.data = data;
    var htmlContent = template.evaluate().getContent();
    return createSafeHtmlOutput(htmlContent);
  } catch (error) {
    Logger.log("Erro em createTemplateHtmlOutput: " + error.message);
    throw error;
  }
}

function createHtmlOutputFromFile(filename) {
  try {
    // Cria um HtmlOutput diretamente de um arquivo, aplicando sanitização.
    var htmlContent = HtmlService.createHtmlOutputFromFile(filename).getContent();
    return createSafeHtmlOutput(htmlContent);
  } catch (error) {
    Logger.log("Erro em createHtmlOutputFromFile: " + error.message);
    throw error;
  }
}
