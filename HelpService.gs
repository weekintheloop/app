/**
 * @file HelpService.gs
 * @description Fornece funções para exibir conteúdo de ajuda ou documentação para os usuários.
 *              Pode carregar conteúdo de ajuda de arquivos HTML ou de uma aba específica da planilha.
 * @integration
 *   - `HtmlService.gs`: Pode ser usado para servir páginas de ajuda formatadas.
 *   - `SheetService.gs`: Pode ser usado para ler conteúdo de ajuda de uma planilha.
 */

function getHelpContent(topic) {
  // Retorna o conteúdo de ajuda para um tópico específico
  // Pode ser lido de um arquivo HTML ou de uma planilha
  switch (topic) {
    case "login":
      return "Instruções para login...";
    case "data_entry":
      return "Como inserir dados fisiológicos...";
    default:
      return "Tópico de ajuda não encontrado.";
  }
}

function serveHelpPage(topic) {
  try {
    // Serve uma página HTML com o conteúdo de ajuda
    var content = getHelpContent(topic);
    return HtmlService.createHtmlOutput("<h1>Ajuda: " + topic + "</h1><p>" + content + "</p>");
  } catch (error) {
    Logger.log("Erro em serveHelpPage: " + error.message);
    throw error;
  }
}
