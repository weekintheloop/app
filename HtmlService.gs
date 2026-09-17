/**
 * @file HtmlService.gs
 * @description Responsável por servir arquivos HTML para o frontend da aplicação web. Permite a inclusão de templates e a passagem de dados para as páginas HTML.
 * @integration
 *   - `Code.gs`: Utilizado pelas funções `doGet` e `doPost` para renderizar as interfaces de usuário.
 *   - Componentes `.html`: Carrega e avalia os arquivos HTML.
 */

function include(filename) {
  try {
    // Função auxiliar para incluir outros arquivos HTML como templates
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    Logger.log("Erro em include: " + error.message);
    throw error;
  }
}

/**
 * Compacta dados estáticos para uso em data URLs (como logos base64)
 * Remove todos os espaços em branco para otimizar o tamanho
 */
function includeInlineData(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent().replace(/\s+/g, '');
}

function serveHtmlFile(filename, data) {
  // Serve um arquivo HTML específico, opcionalmente passando dados para ele
  var safeFilename = sanitizeHtmlFileName_(filename);
  var template;
  try {
    template = HtmlService.createTemplateFromFile(safeFilename);
  } catch (error) {
    template = HtmlService.createTemplateFromFile('NotFoundPage');
  }
  if (data) {
    template.data = data;
  }
  return template.evaluate()
      .setTitle('PICS Multimodal')
      .setFaviconUrl('https://www.gstatic.com/images/branding/product/1x/google_apps_script_64dp.png');
}

function sanitizeHtmlFileName_(filename) {
  var safeFilename = String(filename || 'Login').replace(/\.html$/i, '');
  return /^[A-Za-z0-9_-]+$/.test(safeFilename) ? safeFilename : 'NotFoundPage';
}
